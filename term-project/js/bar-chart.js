const w = 1000;
const h = 580;
const barPadding = 8;

const svg = d3.select('body')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

d3.csv('data/Global Superstore USA.csv', data => {
  let subCategorySet = {};
  for (let d of data) { subCategorySet[d.SubCategory] = 0; }
  for (let i = 0; i < data.length; ++i) {
    subCategorySet[data[i].SubCategory] += parseInt(data[i].Sales);
  }

  let categorySet = {};
  for (let d of data) { categorySet[d.Category] = new Set(); }
  for (let i = 0; i < data.length; ++i) {
    categorySet[data[i].Category].add(data[i].SubCategory);
  }

  let sortByCate = [];
  Object.values(categorySet).forEach((value, index) => {
    console.log([...value]);

    if (index !== Object.values(categorySet).length - 1) {
      sortByCate += [...value] + ',';
    } else {
      sortByCate += [...value];
    }
  });
  sortByCate = sortByCate.split(',');

  let dataset = [];
  for (let i = 0; i < sortByCate.length; ++i) {
    dataset.push(subCategorySet[sortByCate[i]]);
  }
  console.log(dataset);

  svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', (d, index) => index * (w / dataset.length))
    .attr('y', d => h - d / 600)
    .attr('width', w / dataset.length - barPadding)
    .attr('height', d => d / 600)
    .attr('fill', d => {
      if (d < 20000) {
        return 'rgb(0, 0, 60)'
      } else if (d < 100000) {
        return 'rgb(0, 0, 120)'
      } else if (d < 200000) {
        return 'rgb(0, 0, 180)'
      } else {
        return 'rgb(0, 0, 240)'
      }
    })
    .on('mouseover', function() {
      d3.select(this)
        .transition()
        .duration(250)
        .attr('fill', 'orange')
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .transition()
        .duration(250)
        .attr('fill', d => {
          if (d < 20000) {
            return 'rgb(0, 0, 60)'
          } else if (d < 100000) {
            return 'rgb(0, 0, 120)'
          } else if (d < 200000) {
            return 'rgb(0, 0, 180)'
          } else {
            return 'rgb(0, 0, 240)'
          }
        })
    });

  svg.selectAll('text')
    .data(dataset)
    .enter()
    .append('text')
    .text((d, index) => sortByCate[index])
    .attr('x', (d, index) => index * (w / dataset.length) + 5)
    .attr('y', d => h - (d / 600) + 15)
    .style('font-family', 'sans-serif')
    .style('font-size', '11px')
    .style('fill', 'white');
});
