const color = d3.scaleQuantize()
  .range(['rgb(237,248,233)', 'rgb(186,228,179)', 'rgb(116,196,118)',
    'rgb(49,163,84)', 'rgb(0,109,44)']);

const w = 1000;
const h = 600;

const projection = d3.geoAlbersUsa()
  .translate([w / 2, h / 2])
  .scale([1000]);

const path = d3.geoPath()
  .projection(projection);

const svg = d3.select('body')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

d3.csv('data/Global Superstore USA.csv', data => {
  color.domain([
    d3.min(data, d => parseFloat(d.Profit)),
    d3.max(data, d => parseFloat(d.Profit))
  ]);

  d3.json('data/us-states.json', json => {
    for (let i = 0; i < data.length; ++i) {
      let dataState = data[i].State;
      let dataProfit = parseFloat(data[i].Profit);

      for (let j = 0; j < json.features.length; ++j) {
        let jsonState = json.features[j].properties.name;
        if (dataState === jsonState) {
          json.features[j].properties.Profit = dataProfit;
          break;
        }
      }
    }

    svg.selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', d => {
        let profit = d.properties.Profit;
        if (profit) {
          return color(profit);
        } else {
          return '#aaa';
        }
      });

    svg.selectAll('circle')
      .data(json.features)
      .enter()
      .append('circle')
      .attr('cx', d => path.centroid(d)[0])
      .attr('cy', d => path.centroid(d)[1])
      .attr('r', d => Math.sqrt(parseInt(d.properties.Profit)) * 3)
      .style('fill', 'yellow')
      .style('opacity', 0.75);

    svg.selectAll('text')
      .data(json.features)
      .enter()
      .append('text')
      .attr('x', d => path.centroid(d)[0])
      .attr('y', d => path.centroid(d)[1])
      .text(d => [d.properties.name, d.properties.Profit])
      .style('opacity', '0')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(100)
          .style('opacity', '1')
          .attr('fill', 'red')
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(10000)
          .style('opacity', '0')
      })
  });
});

