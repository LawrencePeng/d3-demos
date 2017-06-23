const w = 1000;
const h = 600;

const projection = d3.geoAlbersUsa()
  .translate([w / 2, h / 2])
  .scale([1000]);

const path = d3.geoPath().projection(projection);

const svg = d3.select('body')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

d3.csv('data/Global Superstore USA.csv', data => {
  let stateSet = {};
  for (let d of data) { stateSet[d.State] = 0; }
  for (let i = 0; i < data.length; ++i) {
    stateSet[data[i].State] += parseInt(data[i].Profit);
  }
  console.log(stateSet);

  let dataset = [];
  for (let profit of Object.values(stateSet)) {
    dataset.push(profit);
  }
  console.log(dataset)

  d3.json('data/us-states.json', json => {
    for (let i = 0; i < dataset.length; ++i) {
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
          if (profit > 0 && profit < 20000) {
            return 'rgb(200, 255, 200)'
          } else if (profit < 100000) {
            return 'rgb(150, 255, 150)'
          } else if (profit < 200000) {
            return 'rgb(100, 255, 100)'
          } else {
            return 'rgb(50, 255, 50)'
          }
        } else {
          return '#ddc';
        }
      });

    svg.selectAll('circle')
      .data(json.features)
      .enter()
      .append('circle')
      .attr('cx', d => path.centroid(d)[0])
      .attr('cy', d => path.centroid(d)[1])
      .attr('r', d => Math.sqrt(parseInt(d.properties.Profit)) / 1.5)
      .style('fill', 'orange')
      .style('opacity', 0.75);

    svg.selectAll('text')
      .data(json.features)
      .enter()
      .append('text')
      .attr('x', d => path.centroid(d)[0])
      .attr('y', d => path.centroid(d)[1])
      .text(d => {
        let ret = ''
        ret += d.properties.name
        if (d.properties.Profit) {
          ret += '\n' + d.properties.Profit
        }
        return ret
      })
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
          .duration(1000)
          .style('opacity', '0')
      })
  });
});

