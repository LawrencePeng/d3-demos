//定义量化比例尺（quantize scale），将数据值归入不同的颜色值
const color = d3.scaleQuantize()
  .range(["rgb(169,12,56)", "rgb(198,227,244)", "rgb(165,203,229)", 
    "rgb(134,181,215)", "rgb(107,157,196)", "rgb(85,134,178)", 
    "rgb(65,111,157)", "rgb(46,90,135)"]);

//SVG的宽度和高度
const w = 1000;
const h = 600;

//定义地图的投影
const projection = d3.geoAlbersUsa()
  .translate([w / 2, h / 2])
  .scale([1000]);

//定义路径生成器
const path = d3.geoPath()
  .projection(projection);

//创建SVG元素
const svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

d3.csv("data/states-profits.csv", data => {
  //设置颜色比例尺的定义域，parseFloat将字符串类型转换成浮点数类型
  color.domain([
    d3.min(data, d => parseFloat(d.value)),
    d3.max(data, d => parseFloat(d.value))
  ]);

  //读入GeoJSON数据
  d3.json("data/us-states.json", json => {
    for (let i = 0; i < data.length; ++i) {
      //获取州名
      let dataState = data[i].state;
      //获取该州所对应的数据值，并将字符串类型转换成浮点数类型
      let dataValue = parseFloat(data[i].value);
      
      //在GeoJSON中找到相应的州
      for (let j = 0; j < json.features.length; ++j) {
        let jsonState = json.features[j].properties.name;
        if (dataState === jsonState) {
          json.features[j].properties.value = dataValue;
          break;
        }
      }
    }

    //绑定数据并为每一个GeoJSON feature创建一个路径
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", d => {
        let value = d.properties.value;
        if (value) {
          return color(value);
        } else {
          return "#ccc";
        }
      })

    svg.selectAll("text")
      .data(json.features)
      .enter()
      .append("text")
      .attr("d", path)
      .attr("x", d => path.centroid(d)[0])
      .attr("y", d => path.centroid(d)[1])
      .text(d => [d.properties.name, d.properties.value])
      .style("opacity", "0")
      .on("mouseover", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .style("opacity", "1")
          .attr("fill", "red")
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(10000)
          .style("opacity", "0")
      })
  });
});
