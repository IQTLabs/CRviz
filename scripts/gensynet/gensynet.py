#!/usr/bin/env python3
#
# Generate Synthetic Networks
# First Version: 8/3/2017
#
# An interactive script that generates a JSON file that can be used for
# creating imaginary (enterprise) network profiles
#
# Be warned: user input validation is nearly non-existent.
#
# Cyber Reboot
# alice@cyberreboot.org
#

from datetime import datetime as dt
from random import *
from time import strftime

import argparse
import ipaddress
import json
import math
import string
import sys
import uuid

VERBOSE = True
NET_SUMMARY = False
VERSION = '0.90'
DEBUG = False
OLDVERSION = False


def randstring(size):
    return ''.join(choice(string.ascii_lowercase + string.digits)
                    for _ in range(size))


def divide(dividend, divisor):
    quotient = math.floor(dividend/divisor)
    remainder = dividend % divisor
    return (quotient, remainder)

# you'll want to make sure that prefix is some string that
# is prefixed by some number.
def generate_ip(prefix, octets=4):
    ip = prefix
    if prefix[len(prefix)-1] is not '.':
        prefix = prefix + '.'
    subn = 4 - prefix.count('.')
    if (subn > 0):
        ip = prefix + '.'.join(str(randint(1,252)) for _ in range(subn))
    return ip


def generate_uuid():
    return str(uuid.uuid4())


def generate_fqdn(domain=None, subdomains=0):
    if domain is None:
        domain = randstring(randint(5,10)) + '.local'
    if subdomains == 0:
        return domain
    else:
        hostname = domain

    while (subdomains > 0):
        hostname = randstring(randint(3,5)) + '.' + hostname
        subdomains -= 1
    return hostname


def generate_os_type(devicetype):
    if ( devicetype == 'Business workstation'
      or devicetype == 'Developer workstation'
      or devicetype == 'Mail server'
      or devicetype == 'File server'
      or devicetype == 'Internal web server'
      or devicetype == 'Database server'
      or devicetype == 'Code repository'
      or devicetype == 'SSH server'):
        return choice(['Windows', 'Linux', 'Mac OS X', 'BSD'])
    elif devicetype == 'Smartphone':
        return choice(['iOS', 'Android', 'Blackberry', 'Unknown'])
    elif devicetype == 'DNS server':
        return choice(['Windows', 'Linux', 'Mac OS X', 'BSD', 'Cisco IOS'])
    elif ( devicetype == 'Printer'
      or devicetype == 'PBX'):
        return choice(['Linux', 'Unknown', 'Windows'])
    elif devicetype == 'DHCP server':
        return choice(['Linux', 'Unknown', 'Windows', 'BSD', 'Cisco IOS'])
    elif devicetype == 'Active Directory controller':
        return choice(['Unknown', 'Windows'])
    elif devicetype == 'VOIP phone':
        return choice(['Linux', 'Windows', 'Unknown'])
    elif devicetype == 'Unknown':
        return 'Unknown'
    return os


def generate_mac():
    mac = ':'.join(str(hex(randint(0,15))) + str(hex(randint(0,15)))
                   for _ in range(6))
    return mac.replace('0x', '')


def record(records=None):
    records = [ 'p0f',
                'nmap',
                'BCF']
    return choice(records)


def calculate_subnets(total, breakdown):
    """Returns number of subnets, given the breakdown; or -1 if breakdown doesn't work."""
    sanity_percent = 0 # if this isn't 100% by the end, we got issues.
    subnets = 0
    for nodep, netp in breakdown:
        sanity_percent += nodep
        if (sanity_percent > 100):
            return -1
        subtotal = int(total * .01 * nodep)
        groupby = int(254 * .01 *netp)
        subnets += math.ceil(subtotal/groupby)
    if (sanity_percent < 100):
        return -1
    return subnets


def get_default_dev_distro(nodect, printout=True):
    """Prints device type breakdowns using default ratios and returns a count of each device."""
    if (printout):
        print("Default Device Role Distribution for {} nodes".format(nodect))
    dev_breakdown = {
        'Business workstation': int(math.floor(nodect*.35)),
        'Developer workstation': int(math.floor(nodect*.15)),
        'Smartphone': int(math.floor(nodect*.28)),
        'Printer': int(math.floor(nodect*.03)),
        'Mail server': int(math.floor(nodect*.01)),
        'File server': int(math.floor(nodect*.02)),
        'Internal web server': int(math.floor(nodect*.06)),
        'Database server': int(math.floor(nodect*.01)),
        'Code repository': int(math.floor(nodect*.01)),
        'DNS server': int(math.floor(nodect*.01)),
        'DHCP server': int(math.floor(nodect*.01)),
        'Active Directory controller': int(math.floor(nodect*.01)),
        'SSH server': int(math.floor(nodect*.01)),
        'VOIP phone': 0,
        'PBX': 0,
        'Unknown': int(math.floor(nodect*.04))
    }
                            # any nodes left over gets put into Unknown
    total = 0
    for key, ct in sorted(dev_breakdown.items()):
        if (printout and key != 'Unknown'):
            print("  {:>30} : {}".format(key, ct))
        total += ct
    if (nodect > total):
        dev_breakdown['Unknown'] += (nodect - total)
    if (printout):
        print("  {:>30} : {}".format('Unknown', dev_breakdown['Unknown']))

    return dev_breakdown


def build_configs(subnets, host_count, dev_div, domain=None):
    """Returns a json object of subnet specifications, or None upon error"""
    global VERBOSE
    jsons = []              # subnet breakdown
    unlabeled_hosts = []    # number of hosts in the network w/o roles
    ip_addr = []            # keeping track of the 2nd and 3rd octets in IP
    roles = dict.fromkeys(dev_div.keys(), 0)

    if len(subnets)/254 > 254:
        print("WARNING: You're about to see some really sick IPs. Have fun.")

    for n in subnets:
        addy = (randint(0,253), randint(0,253))
        while addy in ip_addr:
            addy = (randint(0,253), randint(0,253))
        ip_addr.append(addy)
        jsons.append({
                    "start_ip"  : '10.{}.{}.2'.format(addy[0],addy[1]),
                    "subnet"   : '10.{}.{}.0/24'.format(addy[0], addy[1]),
                    "hosts"     : n,
                    "roles"     : roles.copy()
                })
        unlabeled_hosts.append(n)
        if VERBOSE:
            print("start_ip: {}\t number of hosts: {}\t".format(jsons[-1]['start_ip'], jsons[-1]['hosts']))

    # divvy up the roles, now that the subnets are defined
    labeled_hosts = 0
    for dev in dev_div:
        dev_total = dev_div[dev]
        labeled_hosts += dev_total
        while dev_total > 0:
            while True:
                n = randrange(0, len(subnets))
                if (unlabeled_hosts[n] > 0):
                    jsons[n]['roles'][dev] += 1
                    unlabeled_hosts[n] -= 1
                    break
            dev_total -= 1
    if labeled_hosts != host_count:
        print("WARNING: Labeled hosts ({}) didn't equal host count ({})".format(labeled_hosts, host_count))

    return jsons



def randomize_subnet_breakdown(count, minimum, maximum):
    '''
        Returns an array of host counts (where index = subnet), or None if the input is ridiculous.
    '''
    subnets = []
    nodes_left = count

    # I mean, this is tested for very large values of count; I haven't tested very small numbers yet.
    if count <= 0 or minimum > count or maximum > count or minimum < 0 or maximum < 0 or maximum <= minimum:
        return None

                # break count into subnets until count = 0 or < min
    while (nodes_left > 0):
        clients = randint(minimum, maximum)
        subnets.append(clients)
        nodes_left -= clients
        if DEBUG:
            print("DEBUG: subnet count: {}\tnodes left: {}".format(clients, nodes_left))
        if minimum < nodes_left < maximum:
            subnets.append(nodes_left)
            nodes_left = 0
        elif nodes_left < minimum:
            # i.e., if all the subnets are maxed out but don't add up to the requested count,
            # then start all over again, cuz there won't be any way to honor min/max requirement.
            if (len(subnets) * maximum < count):
                subnets.clear()
                nodes_left = count
            else:
                break

                # divvy up the rest of the nodes among the existing subnets
    subnetIDs = [x for x in iter(range(len(subnets)))]
    while (nodes_left > 0):
        s = choice(subnetIDs) # pick a randum subnet
        if DEBUG:
            print("DEBUG: looping with s={}, count={}, left={}".format(s, subnets[s], nodes_left))
        if subnets[s] < maximum:
            subnets[s] += 1
            nodes_left -= 1
        else:
            subnetIDs.remove(s)
    return subnets



def print_network(network_jsn, fname=None, prettyprint=True):
    '''
       Prints the array of network hosts to file fname, or to console if fname is not specified.
    '''

    indent = 2 if prettyprint else None
    if fname:
        with open(fname, 'w') as ofile:
            ofile.write("{}".format(json.dumps(network_jsn, indent=indent)))
    else:
        return json.dumps(outobj, indent=indent)


def build_network(subnets, randomspace=False):
    '''
       Returns an array of host data on a network, in json format.
    '''

    global VERBOSE
    outobj = []
    subnets_togo = len(subnets)
    for n in subnets:
        start_ip = ipaddress.ip_address(n['start_ip'])
        role_ct = dict(n['roles'])
        hosts_togo = n['hosts']
        ip_taken = []
        subnets_togo -= 1

        while (hosts_togo > 0):
            host = {
                'uid':generate_uuid(),
                'mac':generate_mac(),
                'rDNS_host':randstring(randrange(4,9)),
                'subnet':n['subnet']
            }

            if 'domain' in n:
                host['rDNS_domain'] = n['domain']

            host['record'] = {
                'source':record(),
                'timestamp': str(dt.now())
            }

            while True:
                a_role = choice(list(role_ct.keys()))
                if role_ct[a_role] > 0:
                    role_ct[a_role] -= 1
                    host['role'] = {
                        'role': a_role,
                        'confidence': randrange(55,100)
                    }
                    break
                else:
                    del(role_ct[a_role])

            host['os'] = { 'os': generate_os_type(host['role']['role']) }
            if host['os']['os'] != 'Unknown':
                host['os']['confidence'] = randrange(55,100)

            if (randomspace):
                while True:
                    ip = start_ip + randrange(0, 254)
                    if ip not in ip_taken:
                        host['IP'] = str(ip)
                        ip_taken.append(ip)
                        break
            else:
                ip = start_ip + hosts_togo
                host['IP'] = str(ip)

            outobj.append(host)
            hosts_togo -= 1

    return outobj


def config_check(configs, out):
    if NET_SUMMARY or VERBOSE:
        print("\nBased on the following config:\n")
        print(json.dumps(configs, indent=4))
        print("\nSaved network profile to {}".format(out))
    else:
        print("\n Saved network profile to {}".format(out))


def main():
    global VERBOSE, VERSION, NET_SUMMARY, OLDVERSION
    parser = argparse.ArgumentParser()
    parser.add_argument('-q', '--quiet', help='Provide program feedback', action="store_true")
    parser.add_argument('-p', '--prints', help='Prints summary of network configurations to output', action="store_true")
    parser.add_argument('-s', '--save', help='FIlename to output configuration')
    parser.add_argument('--version', help='Prints version', action="store_true")
    args = parser.parse_args()

    if args.version:
        print("{} v{}".format(sys.argv[0], VERSION))
        sys.exit()
    if args.quiet:
        VERBOSE = False
    if args.prints:
        NET_SUMMARY = True

    outname = args.save if args.save else strftime("%Y%m%d-%H%M%S")

    print('\n\n\tSYNTHETIC NETWORK NODE GENERATOR\n')

    while True:
        nodect = int(input("How many network nodes? [500]: ") or "500")

        if nodect > 4000000:
            print("That ("+str(nodect)+") is just exorbitant. Next time try less than 4000000.")
            sys.exit()

                                #  setting subnet breakdown ----------------
        if OLDVERSION:
            if (nodect > 50):
                print('Default Node distribution of {} nodes across Class C subnets: '.format(nodect))
                print('   30% of the nodes will occupy subnets that are 70% populated')
                print('   45% of the nodes will occupy subnets that are 20% populated')
                print('   25% of the nodes will occupy subnets that are 90% populated')
                net_breakdown = [(30,70), (45,20), (25,90)]
                print('Total subnets: {}'.format(calculate_subnets(nodect, net_breakdown)))
                set_net = input("Manually set network node distribution? [No]: ") or "No"
            else:
                set_net = "No"
                net_breakdown = [(100, 100)]
                print('Total subnets: 1')

            if (set_net.lower() != 'no' and set_net.lower() != 'n'):
                net_breakdown = []
                percent = 100
                print("Please enter what percentage of the {} nodes would consume what percentage".format(nodect))
                print("of the Class C address space...")
                while percent > 0:
                    nodes = int(input("   Percent of nodes (MAX={}): ".format(percent)) or "100")
                    density = int(input("   Percent of class C space occupied: ") or "100")
                    if (nodes <= 100 and nodes > 1):
                        percent = percent - nodes
                    else:
                        print("Illegal node percentage value ({})".format(nodes))
                        continue
                    if (density > 100 or density < 1):
                        print("Illegal density percentage value ({})".format(density))
                        continue
                    net_breakdown.append((nodes, density))
                subnets = calculate_subnets(nodect, net_breakdown)
                print('Total subnets: {}'.format(subnets))
        else:
            MAX_max = MAX_min = -1
            while True:
                subnets = []
                if nodect <= 252:
                    subnets.append(nodect)
                else:
                    if MAX_max == -1:
                        MAX_max = 150
                    while True:
                        maximum = int(input('Max hosts in subnet (UP TO 252) [{}]: '.format(MAX_max)) or MAX_max)
                        if (maximum < 3 or maximum > 252):
                            print("Illegal 'maximum' value.")
                        else:
                            break

                    if MAX_min == -1 or maximum != MAX_max:
                        MAX_min = 254-maximum
                    while True:
                        minimum = int(input('Min hosts in subnet (UP TO {}) [{}]: '.format(MAX_min, MAX_min)) or MAX_min)
                        if (minimum < 2 or minimum > MAX_min):
                            print("Illegal 'minimum' value.")
                        else:
                            break
                    MAX_min = minimum
                    MAX_max = maximum

                    subnets = randomize_subnet_breakdown(nodect, minimum, maximum)

                for i, _ in enumerate(subnets):
                    print('\tSubnet #{} has {} hosts.'.format(i, subnets[i]))

                if (nodect > 252):
                    subnets_finished = input("Is this breakout of subnets OK? [Yes]: ") or "Yes"
                    if subnets_finished.lower() in ['yes', 'y']:
                        break
                else:
                    break

                                #  setting device breakdown ----------------
        dev_breakdown = get_default_dev_distro(nodect)
        dev_distr = input("Manually reset the above Device Role Distribution? [No]: ") or "No"
        if (dev_distr.lower() != 'no' and dev_distr.lower() != 'n'):
            remainder = nodect
            for category in sorted(dev_breakdown.keys()):
                if (remainder == 0):
                    dev_breakdown[category] = 0
                    continue
                category_count = dev_breakdown[category]
                while (remainder > 0):
                    if (remainder < category_count):
                        category_count = remainder
                    category_count = int(input("   {} (MAX={}) [{}]: ".format(category, remainder, category_count)) or category_count)
                    remainder -= category_count
                    if (remainder < 0 or category_count < 0):
                        print("Illegal value '{}'".format(category_count))
                        remainder += category_count
                    else:
                        dev_breakdown[category] = category_count
                        break;
            if (remainder > 0):
                dev_breakdown['Unknown'] += remainder

        domain = input("Domain name to use (press ENTER to auto-generate): ") or generate_fqdn()
        randomize = input("Randomize IP addresses in subnet? [Yes]: ") or "Yes"
        cont = input("Ready to generate json (No to start over)? [Yes]: ") or "Yes"
        if cont.lower() in ['yes', 'y']:
            break

    net_configs = build_configs(subnets, nodect, dev_breakdown, domain)

    cont = input("Build complete. Would you like to use this to create a time-series? [No]: ") or "Yes"
    tcount = 0
    outname_full = outname+'_t'+str(tcount)+'.json' if cont.lower() in ['yes', 'y'] else outname+'.json'

    config_check(net_configs, outname_full)

    ntwk = build_network(net_configs, randomspace=True) if randomize.lower() in ['yes', 'y'] else \
           build_network(net_configs)

    if ntwk:
        print_network(ntwk, outname_full)
    else:
        print("Error building out the network hosts.")
        sys.exit()
                              # creating a time series -------------------
    while cont.lower() in ['yes', 'y']:
        tcount += 1
        outname_full = outname + '_t'+str(tcount)+'.json'
        config_check(net_configs, outname_full)
        print_network(ntwk, outname_full)
        cont = input("Build complete. Would you like to build another? [No]: ") or "Yes"


if __name__ == "__main__":
    main()
