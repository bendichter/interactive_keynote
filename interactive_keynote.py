from glob import glob
from shutil import copy
from bs4 import BeautifulSoup as bs

import pdb

def unescape(data):
    data = data.replace('\\"', '"')
    data = data.replace('&gt;', '>')
    data = data.replace('&lt;', '<')
    return data


def escape(data):
    data = data.replace('"', '\\"')
    #data = data.replace('>', '&gt;')
    #data = data.replace('<', '&lt;')
    data = data.replace('\n', ' ')
    return data


def transform2xy(transform):
    x = transform.split(',')[4].strip()
    y = transform.split(',')[5][:-1].strip()
    return x, y


def add_text_to_file(fname, text, before_text='<image xlink:href=\\"845F'):
    with open(fname, 'r') as f:
        otxt = f.read()
    insert_ind = otxt.find(before_text)
    out_txt = otxt[:insert_ind] + text + otxt[insert_ind:]
    with open(fname, 'w') as f:
        f.write(out_txt)
    print(out_txt)

def make_foreignObject(div, x, y, width, height):
    return '<foreignObject x="{}" y="{}" width="{}" height="{}">'.format(x, y, width, height) + \
    '<body id="bokeh_body" xmlns="http://www.w3.org/1999/xhtml">' + div + '</body></foreignObject>'

def insert_bokeh_divs(svgp_filepath, plot_dict):

    with open(svgp_filepath, 'r') as f:
        data = unescape(f.read())

    svg_soup = bs(data[data.find('"svg":"') + 7:-4], 'xml')
    svg = svg_soup.svg

    parents = list(set([x.parent for x in svg.find_all('text')]))
    for parent in parents:
        string = ''.join([x.text for x in parent.find_all('text')])
        for key in plot_dict.keys():
            if string == key:
                g1 = parent.parent
                g2 = g1.find_previous_sibling()
                img = g2.find_previous_sibling()
                height = img.attrs['height']
                width = img.attrs['width']
                x, y = transform2xy(img.attrs['transform'])

                g1.clear()
                g2.clear()
                img.replace_with(make_foreignObject(plot_dict[key][1], x, y, width, height))

    with open(svgp_filepath, 'w') as f:
        f.write(data[:data.find('"svg":"') + 7] + escape(str(svg_soup)) + data[-4:])


def add_header_to_player(target):
    load_bokeh_script = """/* added by interactive keynote */
<script
  src="https://code.jquery.com/jquery-3.2.1.min.js"
  integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
  crossorigin="anonymous"></script>
<link rel="stylesheet" href="../../../bokehjs0_12_6/bokeh.css" type="text/css" />
<script type="text/javascript" src="../../../bokehjs0_12_6/bokeh.js"></script>
<script type="text/javascript">Bokeh.set_log_level("info");</script>
<script type="text/javascript" src="add_bokeh_plots.js"></script>
/* end added by interactive keynote */
"""
    html_fname = target + 'assets/player/KeynoteDHTMLPlayer.html'
    before_html = '<script type="text/javascript" src="prototype.js"></script>'
    add_text_to_file(html_fname, load_bokeh_script, before_html)


def add_bokeh_plots(target, plot_dict):

    add_header_to_player(target)

    copy('/Users/bendichter/Development/interactive_keynote/template_bokeh_plot.js',
         target + '/assets/player/add_bokeh_plots.js')
    for value in plot_dict.values():
        script = value[0]
        script_insert = script[script.find('var docs_json'):script.find('Bokeh.embed')]
        add_text_to_file(target + '/assets/player/add_bokeh_plots.js', script_insert, """/* */""")

    for svgp_filepath in glob(target + '/assets/*/*/*.svgp'):
        insert_bokeh_divs(svgp_filepath, plot_dict)

target = '/Users/bendichter/Development/interactive_keynote/test_pres2/'
