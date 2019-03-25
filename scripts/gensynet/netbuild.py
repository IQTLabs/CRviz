from datetime import datetime as dt
from random import *

import ipaddress
import json
import math
import string
import uuid

DEBUG = False
NET_SUMMARY = False


def update_timestamps(nodes):
    for node in nodes:
        node['record']['timestamp'] = str(dt.now())

def _randstring(size):
    return ''.join(choice(string.ascii_lowercase + string.digits)
                    for _ in range(size))

def _gen_ip(start_ip, ip_taken=None, end_ip=None):
    '''
        Generates a random IP in the same class C subnet as `start_ip`, 
        using `ip_taken` array for deconfliction. Assumes the start_ip 
        basically starts at .2
        Returns the new IP (or None if there was a problem) and an 
        updated `ip_taken` list.
    '''
    ip = ipaddress.ip_address(start_ip)
    ct = 254 - len(ip_taken)
    if ip_taken:
        while ct > 2:
            suffix = randrange(3, 252)
            if ip_taken and suffix not in ip_taken:
                ip += suffix 
                ip_taken.append(suffix)
                break
            ct -= 1
    elif end_ip:
        ip = end_ip + 1
        if str(ip).endswith('.255'):
            ip = None
    else: 
        ip = None

    return str(ip), ip_taken


def _gen_uuid():
    return str(uuid.uuid4())


def gen_fqdn(domain=None, subdomains=0):
    if domain is None:
        domain = _randstring(randint(5,10)) + '.local'
    if subdomains == 0:
        return domain
    else:
        hostname = domain

    while (subdomains > 0):
        hostname = _randstring(randint(3,5)) + '.' + hostname
        subdomains -= 1
    return hostname


def gen_os_type(role):
    if ( role == 'Business workstation'
      or role == 'Developer workstation'
      or role == 'Mail server'
      or role == 'File server'
      or role == 'Internal web server'
      or role == 'Database server'
      or role == 'Code repository'
      or role == 'SSH server'):
        return choice(['Windows', 'Linux', 'Mac OS X', 'BSD'])
    elif role == 'Smartphone':
        return choice(['iOS', 'Android', 'Blackberry', 'Unknown'])
    elif role == 'DNS server':
        return choice(['Windows', 'Linux', 'Mac OS X', 'BSD', 'Cisco IOS'])
    elif ( role == 'Printer'
      or role == 'PBX'):
        return choice(['Linux', 'Unknown', 'Windows'])
    elif role == 'DHCP server':
        return choice(['Linux', 'Unknown', 'Windows', 'BSD', 'Cisco IOS'])
    elif role == 'Active Directory controller':
        return choice(['Unknown', 'Windows'])
    elif role == 'VOIP phone':
        return choice(['Linux', 'Windows', 'Unknown'])
    # elif role == 'Unknown': # catch-all
    return 'Unknown'


def gen_eth_vendor(role):
    if ( role == 'Business workstation'
      or role == 'Developer workstation'
      or role == 'Mail server'
      or role == 'File server'
      or role == 'Internal web server'
      or role == 'Database server'
      or role == 'Code repository'
      or role == 'DNS server'
      or role == 'SSH server'):
        return choice(['Asus', 'VMware', 'Intel', 'Dell', 'Super', 'Mellanox'])
    elif role == 'Smartphone':
        return choice(['Apple','ZTE','Saumsung','LG','Huawei','HTC','Nokia'])
    elif role == 'Printer':
        return choice(['HP','Brother','Canon','Panasonic'])
    elif role == 'PBX':
        return choice(['Asus', 'Cisco', 'VMware', 'Intel', 'Dell', 'Super'])
    elif role == 'DHCP server':
        return choice(['Asus', 'Cisco', 'Juniper', 'VMware', 'Intel', 'Dell', 'Super', 'Mellanox'])
    elif role == 'Active Directory controller':
        return choice(['Asus', 'Cisco', 'VMware', 'Intel', 'Dell', 'Super', 'Mellanox'])
    elif role == 'VOIP phone':
        return choice(['Cisco', 'Panasonic', 'Polycom', 'Avaya', 'Ubiquiti'])
    # elif role == 'Unknown': # catch-all
    return choice(['Unknown','Intel','Dell','Super', 'Asus','Mellanox','VMware','Asus'])


def gen_mac():
    mac = ':'.join(str(hex(randint(0,15))) + str(hex(randint(0,15)))
                   for _ in range(6))
    return mac.replace('0x', '')


def record(records=None):
    records = [ 'p0f',
                'nmap',
                'BCF']
    return choice(records)


def build_configs(subnets, host_count, dev_div, domain=None, VERBOSE=True):
    """Returns a json object of subnet specifications, or None upon error"""
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
        'uid':_gen_uuid(),
        'mac':gen_mac(),
        'rDNS_host':_randstring(randrange(4,9)),
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
    host['os'] = { 'os':gen_os_type(role) }
    if host['os']['os'] != 'Unknown':
        host['os']['confidence'] = randrange(55,100)
    host['vendor'] = gen_eth_vendor(host['role'])

    return host


def build_network(subnets, randomspace=False):
    ''' 
       Returns a network, in the form of an array of hosts in json format.
    '''
    outobj = []
    subnets_togo = len(subnets)
    for n in subnets:
        start_ip = ipaddress.ip_address(n['start_ip'])
        role_ct = dict(n['roles'])
        hosts_togo = n['hosts'] # assumed to never be more than 253
        ip_taken = []
        subnets_togo -= 1

        while hosts_togo > 0:
            a_role = choice(list(role_ct.keys()))
            while role_ct[a_role] == 0:
                del(role_ct[a_role])
                a_role = choice(list(role_ct.keys()))
            role_ct[a_role] -= 1


            if randomspace:
                ip_addr, ip_taken = _gen_ip(start_ip, ip_taken)
                break
            else:
                ip_addr += hosts_togo

            host = make_host(n, a_role, ip_addr)
            outobj.append(host)
            hosts_togo -= 1
        n['ip_taken'] = ip_taken

    return subnets, outobj


def print_netconfig(configs, out, summary=False, VERBOSE=False):
    if summary or VERBOSE:
        print("\nBased on the following config:\n")
        print(json.dumps(configs, indent=4))
    print("\nSaved network profile to {}".format(out))


def add_hosts(subnets, hosts, add_ct):
    '''
        Adds the specified number (add_ct) of hosts from the `hosts` array;
        returns the list unchanged if there's an error.
        (Fails silently, in other words.)
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
        while new_nodes > 0:
            role = choice(list(subnets[n]['roles'].keys()))
            subnets[n]['roles'][role] += 1
            if subnets[n]['ip_taken']:
                ip_addr, subnets[n]['ip_taken'] = _gen_ip(subnets[n]['start_ip'],
                                                          ip_taken=subnets[n]['ip_taken'])
                break
            else:
                end_ip = ipaddress.ip_address(subnets[n]['start_ip']) + subnets[n]['hosts']-1
                ip_addr, _ = _gen_ip(subnets[n]['start_ip'], end_ip=end_ip)
            if ip_addr:
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


def mod_role(subnets, hosts, host=None):
    '''
        Modifies the host's role.
    '''
    print("Entered mod_role")
    if not host:
        host = choice(hosts)

    for net in subnets:
        if host['subnet'] == net['subnet']:
            if (len(net['roles'].keys()) == 1):
                mod_subnet(subnets, hosts, host)
                break
            new_role = choice(list(net['roles'].keys()))
            while new_role == host['role']['role']:
                new_role = choice(list(net['roles'].keys()))
            print("DEBUG: Changing host's role to "+new_role+" from "+host['role']['role'])
            net['roles'][host['role']['role']] -= 1
            net['roles'][new_role] += 1
            host['role']['role'] = new_role
            host['role']['confidence'] = randrange(55,100)
            host['os'] = gen_os_type(new_role)
            host['vendor'] = gen_eth_vendor(new_role)
            break
    return subnets, hosts

def mod_OS(subnets, hosts, host=None):
    '''
        Modifies the host's role. (The `subnets` is not modified.)
    '''
    print("Entered mod_OS")
    if not host:
        host = choice(hosts)
    ct = 0
    while ct > 3:
        new_os = gen_os_type(host['role'])
        if new_os != host['os']:
            host['os'] = new_os
            print("DEBUG: Changing host's OS from "+new_os+" from "+host['os'])
            return subnets, hosts
        ct += 1
    return mod_role(subnets, hosts)


def mod_subnet(subnets, hosts, host=None):
    '''
        Modifies the host's subnet, and updates the `subnets` in kind.
    '''
    print("Entered mod_subnet")
    if not host:
        host = choice(hosts)

    new_net = randrange(0,len(subnets))
    for net in subnets:
        if host['subnet'] == net['subnet']:
            while subnets[new_net]['subnet'] == net['subnet']:
                new_net = randrange(0,len(subnets))
            net['hosts'] -= 1
            subnets[new_net]['hosts'] += 1
            net['roles'][host['role']['role']] -= 1
            subnets[new_net]['roles'][host['role']['role']] += 1
            host['subnet'] = subnets[new_net]['subnet']
            if subnets[new_net]['ip_taken']:
                host['IP'], subnets[new_net]['ip_taken'] = _gen_ip(subnets[new_net]['start_ip'], 
                                                            ip_taken=subnets[new_net]['ip_taken'])
            else:
                end_ip = ipaddress.ip_address(subnets[new_net]['start_ip']) + \
                         subnets[new_net]['hosts']-1
                host['IP'], _ = str(_gen_ip(subnets[new_net]['start_ip'], end_ip=end_ip))
    return subnets, hosts

def mod_hosts(subnets, hosts, mod_ct):
    '''
        Modifies a `mod_ct` number of nodes in ntw; returns the list
        unchanged if there's an error. (Fails silently, in other words.)
        The configuration of subnets also gets updated and returned.
    '''
    modifications = {
        0: mod_role,
        1: mod_OS,
        2: mod_subnet
    }
    while mod_ct > 0:
        modify = modifications.get(2)
        #modify = modifications.get(randrange(0,3))
        subnets, hosts = modify(subnets, hosts)
        mod_ct -= 1

    return subnets, hosts



