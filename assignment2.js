var data;
var data2;
var data3;
var mapcolors = {}
var current_wave = 2;
var map;
var current_variable = "happiness";
var periods = ["Wave 2(90-94)","Wave 3(95-99)", "Wave 4(00-04)", "Wave 5(05-09)", "Wave 6(10-14)"];
var chosen_country;

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
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                choose_country(geography.properties.name);
            });
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
    test();
}

function choose_country(country_name){
	for(key in data){
		if(data[key].country == country_name && data[key].wave == current_wave){
			console.log(data[key])
				d3.select("#chart").html("");
			test(data[key])
		}
	}
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


function test(country_data){
	chosen_country = country_data.country;
	var RadarChart = {
	  draw: function(id, d, options){
	  var cfg = {
		 radius: 5,
		 w: 600,
		 h: 500,
		 factor: 1,
		 factorLegend: 1,
		 levels: 3,
		 maxValue: 1,
		 radians: 2 * Math.PI,
		 opacityArea: 0.5,
		 ToRight: 5,
		 TranslateX: 80,
		 TranslateY: 50,
		 ExtraWidthX: 100,
		 ExtraWidthY: 100,
		};
		
		if('undefined' !== typeof options){
		  for(var i in options){
			if('undefined' !== typeof options[i]){
			  cfg[i] = options[i];
			}
		  }
		}
		cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		var allAxis = (d[0].map(function(i, j){return i.axis}));
		var total = allAxis.length;
		var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
		var Format = d3.format('%');
		d3.select(id).select("svg").remove();
		
		var g = d3.select(id)
				.append("svg")
				.attr("width", cfg.w+cfg.ExtraWidthX)
				.attr("height", cfg.h+cfg.ExtraWidthY)
				.style("background-color", 'white')
				.append("g")
				.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
				;

		var tooltip;
		
		//Circular segments
		for(var j=0; j<cfg.levels-1; j++){
		  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
		  g.selectAll(".levels")
		   .data(allAxis)
		   .enter()
		   .append("svg:line")
		   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
		   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
		   .attr("class", "line")
		   .style("stroke", "grey")
		   .style("stroke-opacity", "0.75")
		   .style("stroke-width", "0.3px")
		   .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
		}

		
		//Text indicating at what % each level is
		for(var j=0; j<cfg.levels; j++){
		  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
		  g.selectAll(".levels")
		   .data([1]) //dummy data
		   .enter()
		   .append("svg:text")
		   .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
		   .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
		   .attr("class", "legend")
		   .style("font-family", "sans-serif")
		   .style("font-size", "10px")
		   .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
		   .attr("fill", "#737373")
		   .text(4-3*((j+1)*cfg.maxValue/cfg.levels));
		}
		
		series = 0;

		var axis = g.selectAll(".axis")
				.data(allAxis)
				.enter()
				.append("g")
				.attr("class", "axis");

		axis.append("line")
			.attr("x1", cfg.w/2)
			.attr("y1", cfg.h/2)
			.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
			.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
			.attr("class", "line")
			.style("stroke", "grey")
			.style("stroke-width", "1px");

		axis.append("text")
			.attr("class", "legend")
			.text(function(d){return d})
			.style("font-family", "sans-serif")
			.style("font-size", "11px")
			.attr("text-anchor", "middle")
			.attr("dy", "1.5em")
			.attr("transform", function(d, i){return "translate(0, -10)"})
			.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
			.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});

	 
		d.forEach(function(y, x){
		  dataValues = [];
		  g.selectAll(".nodes")
			.data(y, function(j, i){
			  dataValues.push([
				cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
				cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
			  ]);
			});
		  dataValues.push(dataValues[0]);
		  g.selectAll(".area")
						 .data([dataValues])
						 .enter()
						 .append("polygon")
						 .attr("class", "radar-chart-serie"+series)
						 .style("stroke-width", "2px")
						 .attr("points",function(d) {
							 var str="";
							 for(var pti=0;pti<d.length;pti++){
								 str=str+d[pti][0]+","+d[pti][1]+" ";
							 }
							 return str;
						  })
						 .style("fill-opacity", cfg.opacityArea)
						 .on('mouseover', function (d){
											z = "polygon."+d3.select(this).attr("class");
											g.selectAll("polygon")
											 .transition(200)
											 .style("fill-opacity", 0.1); 
											g.selectAll(z)
											 .transition(200)
											 .style("fill-opacity", .7);
										  })
						 .on('mouseout', function(){
											g.selectAll("polygon")
											 .transition(200)
											 .style("fill-opacity", cfg.opacityArea);
						 });
		  series++;
		});
		series=0;


		d.forEach(function(y, x){
		  g.selectAll(".nodes")
			.data(y).enter()
			.append("svg:circle")
			.attr("class", "radar-chart-serie"+series)
			.attr('r', cfg.radius)
			.attr("alt", function(j){return Math.max(j.value, 0)})
			.attr("cx", function(j, i){
			  dataValues.push([
				cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
				cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
			]);
			return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
			})
			.attr("cy", function(j, i){
			  return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
			})
			.attr("data-id", function(j){return j.axis})
			.on('mouseover', function (d){
						newX =  parseFloat(d3.select(this).attr('cx')) - 10;
						newY =  parseFloat(d3.select(this).attr('cy')) - 5;
						
						tooltip
							.attr('x', newX)
							.attr('y', newY)
							.text((4-(3*d.value)).toFixed(2))
							.transition(200)
							.style('opacity', 1);
							
						z = "polygon."+d3.select(this).attr("class");
						g.selectAll("polygon")
							.transition(200)
							.style("fill-opacity", 0.1); 
						g.selectAll(z)
							.transition(200)
							.style("fill-opacity", .7);
					  })
			.on('mouseout', function(){
						tooltip
							.transition(200)
							.style('opacity', 0);
						g.selectAll("polygon")
							.transition(200)
							.style("fill-opacity", cfg.opacityArea);
					  })
			.append("svg:title")
			.text(function(j){return Math.max((4-(3*j.value)), 0).toFixed(2)});

		  series++;
		});
		//Tooltip
		tooltip = g.append('text')
				   .style('opacity', 0)
				   .style('font-family', 'sans-serif')
				   .style('font-size', '13px');
	  }
	};

	var w = 500,
		h = 500;
	//Data
	var d = [
			  [
				{axis:"Health",value: (4/3-(country_data.health/3))},
				{axis:"Happiness",value: 4/3-(country_data.happiness/3)},
				{axis:"Work",value: 4/3-(country_data.work/3)},
				{axis:"Family",value: 4/3-((country_data.family)/3)},
				{axis:"Friends",value: 4/3-((country_data.friends)/3)},
				{axis:"Religion",value: 4/3-((country_data.religion)/3)},
				{axis:"Leisure Time",value: 4/3-((country_data['leisure time'])/3)},
				{axis:"Politics",value: 4/3-((country_data.politics)/3)},
			  ]
			];

	//Options for the Radar chart, other than default
	var mycfg = {
	  w: w,
	  h: h,
	  maxValue: 1,
	  levels: 3,
	  ExtraWidthX: 300
	}

	//Call function to draw the Radar chart
	//Will expect that data is in %'s
	RadarChart.draw("#chart", d, mycfg);

	var svg = d3.select('#radar-container')
	.selectAll('svg')
	.append('svg')
	.attr("width", w+300)
	.attr("height", h)

//Create the title for the legend
	var text = svg.append("text")
	.attr("class", "title") 
    .attr("x", 10)
    .attr("y", 35)
    .style('font-size', '24px')
    .style('font-weight', 'bold')
	.text(chosen_country);

}

function update_radargraph(){
	for(var key in data){
		if(data[key].wave == current_wave && chosen_country == data[key].country){
			console.log(data[key])
			test(data[key]);

		}
	}
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
      	update_radargraph()
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
	    display_string = "Percieved Happiness during " + periods[current_wave-2]
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
