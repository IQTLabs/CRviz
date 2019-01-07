#!/usr/bin/env python3
#
# To convert a CSV file to a JSON file useable within CRviz, run
# the script as follows:
#       csv_to_json.py [-o OUTPUT] CSVFILE
#
# By default, the output will be the CSVFILE's name + '.json'
# and it is assumed that the first line of the CSV file will
# contain column headers, which will become the keys within the
# json object. Use -o to explicitly name the JSON file.
#
# Any questions? Ask @lilchurro

import argparse
import csv
import json

from os import path


def convert_csv_to_json(input_f, output_f):
    '''Takes the name of a CSV file and converts it to a CRviz-compatible json file named by output.
    Returns True if everything works out, or False if not.'''
    csvf = open(input_f, 'r')

    try:
        jsonf = open(output_f, 'w', newline="\n")
        jsonf.write('{ "dataset": [\n')

        reader = csv.DictReader(csvf)
        first = True
        for row in reader:
                                        # This is a hack and I hate myself for doing it.
            if not first:               # I couldn't come up with a way to add a trailing
                jsonf.write(',\n')      # comma at the end of every line except the last, AND
            first = False               # also render the '\n' character when writing to file.
            jsonf.write(json.dumps(row, indent=4, sort_keys=True))
        jsonf.write('\n] }')
    except IOError:
        print("ERROR: Couldn't open the output file for writing.")
        return False

    csvf.close()
    jsonf.close()

    return True

def main():
    p = argparse.ArgumentParser(description="Converts a CSV file into a json file for CRviz.")
    p.add_argument('CSVFILE', type=str, help="CSV file to convert (default is filename.json)")
    p.add_argument('-o', '--output', type=str, help="Name of json output file")
    p.add_argument('-d', '--debug', action='store_true', help="Name of json output file")
    args = p.parse_args()

    cfile = args.CSVFILE
    if not path.isfile(cfile):
        print("ERROR: The input file was not found; nothing to convert.")
        return(1)

    jfile = args.output if args.output is not None else path.splitext(path.basename(cfile))[0] + ".json"

    if (args.debug):
        print("csv file: "+cfile)
        print("basename: "+jfile)

    convert_csv_to_json(cfile, jfile)

    return 0


if __name__ == "__main__":
    main()
