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
                    "subnet"    : '10.{}.{}.0/24'.format(addy[0], addy[1]),
                    "domain"    : domain if domain else None,
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
        print("SANITYCHECK FAIL: Labeled host count ({}) != host count ({})".format(labeled_hosts, host_count))
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
        s = choice(subnetIDs) # pick a random subnet
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


def make_host(net, role, ip_addr):
    '''
       Returns a host's metadata, in json form.
    '''
    host = {
        'uid':generate_uuid(),
        'mac':generate_mac(),
        'rDNS_host':randstring(randrange(4,9)),
        'subnet':net['subnet'],
        'IP': str(ip_addr),
        'record': {
            'source':record(),
            'timestamp':str(dt.now())
        },
        'role': {
            'role': role,
            'confidence': randrange(55,100)
        }
    }

    if 'domain' in net:
        host['rDNS_domain'] = net['domain']
    host['os'] = { 'os':generate_os_type(role) }
    if host['os']['os'] != 'Unknown':
        host['os']['confidence'] = randrange(55,100)

    return host


def build_network(subnets, randomspace=False):
    '''
       Returns a network, in the form of an array of hosts in json format.
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

        while hosts_togo > 0:
            a_role = choice(list(role_ct.keys()))
            while role_ct[a_role] == 0:
                del(role_ct[a_role])
                a_role = choice(list(role_ct.keys()))
            role_ct[a_role] -= 1

            ip_addr = start_ip  # prefix; find suffix
            if randomspace:
                while True:
                    ip = randrange(0, 254)
                    if ip not in ip_taken:
                        ip_addr += ip
                        ip_taken.append(ip)
                        break
            else:
                ip_addr += hosts_togo

            host = make_host(n, a_role, ip_addr)
            outobj.append(host)
            hosts_togo -= 1
        n['ip_taken'] = ip_taken

    return subnets, outobj


def config_check(configs, out):
    if NET_SUMMARY or VERBOSE:
        print("\nBased on the following config:\n")
        print(json.dumps(configs, indent=4))
        print("\nSaved network profile to {}".format(out))
    else:
        print("\n Saved network profile to {}".format(out))


def add_hosts(subnets, hosts, add_ct):
    '''
        Adds the specified number (add_ct) of hosts from the `hosts` array;
        returns the list unchanged if there's an error.
        The configuration of subnets also gets updated and returned.
    '''
    while add_ct > 0:
        n = randrange(0, len(subnets))
        new_nodes = randrange(1, math.floor(add_ct/2)) if add_ct > 4 else add_ct
        while new_nodes+subnets[n]['hosts'] > 254:
            new_nodes = randrange(1, new_nodes)
            print("Picking another number of nodes ({}|{})".format(new_nodes,subnets[n]['hosts']))
        subnets[n]['hosts'] += new_nodes
        add_ct -= new_nodes
        if VERBOSE:
            print("Adding {} new nodes to subnet {}".format(new_nodes, subnets[n]['subnet']))
        while new_nodes > 0:
            role = choice(list(subnets[n]['roles'].keys()))
            subnets[n]['roles'][role] += 1
            ip_addr = ipaddress.ip_address(subnets[n]['start_ip'])
            while True:
                ip = randrange(0, 254)
                if ip not in subnets[n]['ip_taken']:
                    ip_addr += ip
                    subnets[n]['ip_taken'].append(ip)
                    break
            if VERBOSE:
                print("Adding "+role+" to subnet "+subnets[n]['subnet'])
            hosts.append(make_host(subnets[n],role,ip_addr)) 
            new_nodes -= 1
    return subnets, hosts

def del_hosts(subnets, hosts, del_ct):
    '''
        Deletes the specified number (del_ct) of hosts from the `hosts` array;
        returns the list unchanged if there's an error.
        The configuration of subnets also gets updated and returned.
    '''
    while del_ct in range(1,len(hosts)):
        h = hosts.pop(randrange(0, len(hosts)))
        for n in subnets:
            if n['subnet'] == h['subnet']:
                n['hosts'] -= 1
        del_ct -= 1

    return subnets, hosts

def timeseries_breakdown(total_nodes):
    '''
        Returns a tuple specifying breakdown of nodes that need to be added, removed, and modified.
    '''
    if total_nodes < 100:
        return (-1, -1, -1)

    happy = 'No'
    while happy.lower() not in ['yes','y']:
        total_percentage = int(input("What percent of the network should change? [0]: ") or "0")
        if total_percentage == 0:
            return (0, 0, 0)
        while total_percentage not in range(0, 101):
            total_percentage = int(input("Illegal percentage value; try again [0]: ") or "0")

        print("Of this total percentage, what percentage of nodes should be:")
        total = 100

        percent_modded = int(input("\t...modified? [0]: ") or "0")
        while percent_modded not in range(0,101):
            percent_modded = int(input("Illegal percentage value; try again [0]: ") or "0")
        total -= percent_modded

        if total == 0:
            print("\t...added? 0")
            percent_added = 0
        else:
            percent_added = int(input("\t...added? [0]: ") or "0")
            while percent_added not in range(0,total+1):
                percent_added = int(input("Illegal percentage value; try again [0]: ") or "0")
        total -= percent_added

        percent_removed = total
        print("\t...removed? "+str(percent_removed))
        happy = input("Happy with this breakdown? [Yes]: ") or "Yes"

    total_changes = math.floor(total_nodes * total_percentage/100)
    total_add = math.floor(total_changes * percent_added/100)
    total_mod = math.floor(total_changes * percent_modded/100)
    total_rm = math.floor(total_changes * percent_removed/100)

    return (total_add, total_rm, total_mod)

def update_timestamps(nodes):
    for node in nodes:
        node['record']['timestamp'] = str(dt.now())

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
        if nodect not in range(1, 4000000):
            print("That ("+str(nodect)+") is just exorbitant. Next time try less than 4000000.")
            sys.exit()

                                #  setting subnet breakdown ----------------
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
                    if maximum not in range(3, 253):
                        print("Illegal 'maximum' value.")
                    else:
                        break
                if MAX_min == -1 or maximum != MAX_max:
                    MAX_min = 254-maximum
                while True:
                    minimum = int(input('Min hosts in subnet (UP TO {}) [{}]: '.format(MAX_min, MAX_min)) or MAX_min)
                    if minimum not in range(2, MAX_min+1):
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
                    category_count = int(input("   {} (MAX={}) [{}]: ".format(category, remainder, category_count)) \
                                     or category_count)
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
    print("Build complete.\n")

    if nodect > 252:
        cont = input("Would you like to use this to create a time-series? [No]: ") or 'No'
    else:
        cont = 'No'

    tcount = 0
    outname_full = outname+'_t'+str(tcount)+'.json' if cont.lower() in ['yes', 'y'] else outname+'.json'

    config_check(net_configs, outname_full)

    net_configs, ntwk = build_network(net_configs, randomspace=True) if randomize.lower() in ['yes', 'y'] else \
                        build_network(net_configs)

    if ntwk:
        print_network(ntwk, outname_full)
    else:
        print("Error building out the network hosts.")
        sys.exit()
                              # creating a time series -------------------
    while cont.lower() in ['yes', 'y']:
        nodes_add, nodes_del, nodes_mod = timeseries_breakdown(len(ntwk))

        net_configs, ntwk = del_hosts(net_configs, ntwk, nodes_del)
        net_configs, ntwk = add_hosts(net_configs, ntwk, nodes_add)
        #net_configs, ntwk = mod_hosts(net_configs, ntwk, nodes_mod)
        update_timestamps(ntwk)

        tcount += 1
        outname_full = outname + '_t'+str(tcount)+'.json'
        config_check(net_configs, outname_full)
        print_network(ntwk, outname_full)
        cont = input("Build complete. Would you like to build another? [No]: ") or "Yes"


if __name__ == "__main__":
    main()
