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

from netbuild import *
from time import strftime

import argparse
import math
import sys

VERBOSE = True
NET_SUMMARY = False
VERSION = '0.90'
DEBUG = False
OLDVERSION = False



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


def main():
    global VERBOSE, VERSION, NET_SUMMARY, OLDVERSION
    parser = argparse.ArgumentParser()
    parser.add_argument('-q', '--quiet', help='silence verbose feedback', action="store_true")
    parser.add_argument('-n', '--netconfig', help='outputs final network configuration', action="store_true")
    parser.add_argument('-s', '--save', help='filename to save hosts file')
    parser.add_argument('--version', help='prints version', action="store_true")
    args = parser.parse_args()

    if args.version:
        print("{} v{}".format(sys.argv[0], VERSION))
        sys.exit()
    if args.quiet:
        VERBOSE = False
    if args.netconfig:
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

        domain = input("Domain name to use (press ENTER to auto-generate): ") or gen_fqdn()
        randomize = input("Randomize IP addresses in subnet? [Yes]: ") or "Yes"
        cont = input("Ready to generate json (No to start over)? [Yes]: ") or "Yes"
        if cont.lower() in ['yes', 'y']:
            break

    net_configs = build_configs(subnets, nodect, dev_breakdown, domain, VERBOSE)
    print("Build complete.\n")

    if nodect > 252:
        cont = input("Would you like to use this to create a time-series? [No]: ") or 'No'
    else:
        cont = 'No'

    tcount = 0
    outname_full = outname+'_t'+str(tcount)+'.json' if cont.lower() in ['yes', 'y'] else outname+'.json'

    print_netconfig(net_configs, outname_full, NET_SUMMARY, VERBOSE)

    net_configs, ntwk = build_network(net_configs, randomspace=True) if randomize.lower() in ['yes', 'y'] else \
                        build_network(net_configs)

    print_network(net_configs, 'config-'+outname_full)
    if ntwk:
        print_network(ntwk, outname_full)
    else:
        print("Error building out the network hosts.")
        sys.exit()
                              # creating a time series -------------------
    while cont.lower() in ['yes', 'y']:
        nodes_add, nodes_del, nodes_mod = timeseries_breakdown(len(ntwk))

        update_timestamps(ntwk)
        net_configs, ntwk = del_hosts(net_configs, ntwk, nodes_del)
        net_configs, ntwk = add_hosts(net_configs, ntwk, nodes_add)
        net_configs, ntwk = mod_hosts(net_configs, ntwk, nodes_mod)

        tcount += 1
        outname_full = outname + '_t'+str(tcount)+'.json'
        print_netconfig(net_configs, outname_full, NET_SUMMARY, VERBOSE)
        print_network(ntwk, outname_full)
        cont = input("Build complete. Would you like to build another? [No]: ") or "Yes"


if __name__ == "__main__":
    main()
