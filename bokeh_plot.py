from bokeh.plotting import figure
from bokeh.embed import components

plot = figure(responsive=True, toolbar_location="above")
plot.circle([1,2], [3,4])

script, div = components(plot)

filename = 'bokeh_plot.txt'

with open(filename, "w") as file:
    file.write(script)
    file.write(div)