var data;
var data2;
var data3;
var mapcolors = {}
var current_wave = 2;
var map;
var current_variable = "happiness";
var periods = ["Wave 2(90-94)","Wave 3(95-99)", "Wave 4(00-04)", "Wave 5(05-09)", "Wave 6(10-14)"];

function get_data(){
  return $.ajax({
    url:"xd.json",
    dataType:"json",
    async: false,
    success: function(json){
      data = json;
    }
  });
}

function get_data2(){
  return $.ajax({
    url:"iso2names.json",
    dataType:"json",
    async: false,
    success: function(json){
      data2 = json;
    }
  });
}

function get_data3(){
  return $.ajax({
    url:"iso32.json",
    dataType:"json",
    async: false,
    success: function(json){
      data3 = json;
    }
  });
}

function convert(){
	for (var key in data){
		for(var key2 in data2){
			if(data[key].country == data2[key2]){
				data[key].iso2 = key2;
				for(var key3 in data3){
					if(data[key].iso2 == key3)
						data[key].iso3 = data3[key3];
				}
			}
		}
	}

}

function draw_map(){
	d3 = d3version3;
	console.log(d3.version)

	get_data()
	get_data2()
	get_data3()
	convert()

	for(var key in data){
		if(data[key].wave == current_wave)
		mapcolors[data[key].iso3] = {
			fillColor: perc2color(data[key].happiness),
		 	happiness: data[key].happiness, 
		 	health: data[key].health, 
		 	family: data[key].family, 
		 	friends: data[key].friends, 
		 	work: data[key].work,
		 	politics: data[key].politics,
		 	religion: data[key].religion,	
		}
	}
	console.log(data)


    map = new Datamap({element: document.getElementById('container'), 
    	fills: {
            HIGH: '#afafaf',
            LOW: '#123456',
            MEDIUM: 'blue',
            UNKNOWN: 'rgb(0,0,0)',
            defaultFill: 'gray'
        },
	    geographyConfig: {
	            popupTemplate: function(geo, data) {
	                return ['<div class="hoverinfo">' +  geo.properties.name,
				            '<br/>Wave: ' +  current_wave + '',
				            '<br/>' + current_variable + ': ' +  data[current_variable].toFixed(2),
				            '</div>'].join('');
	            }
        }});

    map.updateChoropleth(mapcolors);
    draw_legend();
    draw_slider();

    var svg = d3.select("svg");
    svg.selectAll('path')
    	.attr("onclick", function(){console.log("xd")});
}



function draw_legend(){

	var svg = d3.select("svg");
	var defs = svg.append("defs");


	var linearGradient = defs.append("linearGradient")
	    .attr("id", "linear-gradient")
	    .attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "0%")
	    .attr("y2", "100%");
	    

	linearGradient.selectAll("stop")
	    .data([
	        {offset: "0%", color: perc2color(1)},
	        {offset: "16.7%", color: perc2color(1.5)},
	        {offset: "33.3%", color: perc2color(2)},
	        {offset: "50%", color: perc2color(2.5)},
	        {offset: "66.7%", color: perc2color(3)},
	        {offset: "83.3%", color: perc2color(3.5)},
	        {offset: "100%", color: perc2color(3.99)}
	      ])
	    .enter().append("stop")
	    .attr("offset", function(d) { return d.offset; })
	    .attr("stop-color", function(d) { return d.color; });

	svg.append("rect")
    .attr("width", 20)
    .attr("height", 140)
    .attr("x", 20)
	.attr("y", 430)
    .style("fill", "url(#linear-gradient)");

    svg.append("g").append("text")
    .classed("bottomlegend", true)
    .attr("x", 45)
    .attr("y", 442)
    .text("1(Very Important)");

    svg.append("g").append("text")
    .classed("toplegend", true)
    .attr("x", 45)
    .attr("y", 568)
    .text("4(Not at all Important)");

    svg.append("g").append("text")
    .classed("legend", true)
    .attr("x", 20)
    .attr("y", 410)
    .text("Legend")
    .style('font-size', '24px')
    .style('font-weight', 'bold');

    svg.append("g").append("text")
    .classed("infotext", true)
    .attr("x", 10)
    .attr("y", 35)
    .text("Percieved happiness")
    .style('font-size', '24px')
    .style('font-weight', 'bold');
}



function update(time){
	current_wave = time;
	mapcolors = {}
	for(var key in data){
		if(data[key].wave == current_wave)
		mapcolors[data[key].iso3] = {fillColor: perc2color(data[key][current_variable]), [current_variable]: data[key][current_variable]}
	}
    map.updateChoropleth(mapcolors,{reset: true});
}

function change_parameter(variable){
	current_variable = variable;
	mapcolors = {}
	for(var key in data){
		if(data[key].wave == current_wave)
		mapcolors[data[key].iso3] = {fillColor: perc2color(data[key][current_variable]), [current_variable]: data[key][current_variable]}
	}
    map.updateChoropleth(mapcolors,{reset: true});
    update_infotext();
}

function draw_slider(){
	console.log(d3version5.version)
	d3 = d3version5;

	var sliderStep = d3
    .sliderBottom()
    .min(0)
    .max(4)
    .width(800)
    .ticks(5)
    .tickFormat(function(d){ return "Wave "+ (d+2) + "(" + (5*d+1990).toString().slice(-2) + "-" + (5*d+1994).toString().slice(-2) +")"})
    .step(1)
    .displayValue(false)
    .on('onchange', val => {
    	update((val+2))
      	update_infotext()
    });

  var gStep = d3
    .select('div#slider-step')
    .append('svg')
    .attr('width', 1056)
    .attr('height', 70)
    .append('g')
    .attr('transform', 'translate(120,20)');

  gStep.call(sliderStep);

  update_infotext()
}

function update_infotext(){
	var display_string;
	var legendlower;
	var legendhigher;
	switch(current_variable) {
	  case 'happiness':
	    display_string = "Percieved Happines during " + periods[current_wave-2]
	    legendlower = "1(Very Happy)";
	    legendhigher = "4(Not at all Happy)"
	    break;
	  case 'health':
	    display_string = "Percieved Health during " + periods[current_wave-2]
	    legendlower = "1(Very Good)";
	    legendhigher = "4(Poor)"
	    break;
	  case 'family':
	    display_string = "Importance of Family during " + periods[current_wave-2]
	    legendlower = "1(Very Important)";
	    legendhigher = "4(Not at all Important)";
	    break;
	  case 'friends':
	    display_string = "Importance of Friends during " + periods[current_wave-2]
	    legendlower = "1(Very Important)";
	    legendhigher = "4(Not at all Important)";
	    break;
	  case 'work':
	    display_string = "Importance of Work during " + periods[current_wave-2]
	    legendlower = "1(Very Important)";
	    legendhigher = "4(Not at all Important)";
	    break;
	  case 'religion':
	    display_string = "Importance of Religion during " + periods[current_wave-2]
	    legendlower = "1(Very Important)";
	    legendhigher = "4(Not at all Important)";
	    break;
	  case 'politics':
	    display_string = "Importance of Politics during " + periods[current_wave-2]
	    legendlower = "1(Very Important)";
	    legendhigher = "4(Not at all Important)";
	    break;
	  case 'leisure time':
	    display_string = "Importance of Leisure Time during " + periods[current_wave-2]
	    legendlower = "1(Very Important)";
	    legendhigher = "4(Not at all Important)";
	    break;
	  default:
	    // code block
	}
	d3.select('.infotext').text(display_string);
	d3.select('.bottomlegend').text(legendlower);
	d3.select('.toplegend').text(legendhigher);
}

function perc2color(perc) {
	if(perc < 1){
		perc = 1;
	} else if (perc > 4) {
		perc = 4; 
	}
	perc *= -100/3;
	perc += 133;
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}



console.log(mapcolors)
