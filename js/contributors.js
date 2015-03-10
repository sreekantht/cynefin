google.load('visualization', '1', {'packages': ['corechart', 'table']});

/**
 * Contributors stats
 * @param {string} basePath
 */
var Contributors = function(basePath) {

  this.counties = [{"name": "Radnor", "namecy": "Maesyfed", "collection": "83511215"}, {"name": "Pembroke", "namecy": "Penfro", "collection": "51277134"}, {"name": "Montgomery", "namecy": "Maldwyn", "collection": "19043053"}, {"name": "Monmouth", "namecy": "Mynwy", "collection": "86808972"}, {"name": "Merioneth", "namecy": "Meirionnydd", "collection": "54574891"}, {"name": "Glamorgan", "namecy": "Morgannwg", "collection": "22340810"}, {"name": "Flint", "namecy": "Fflint", "collection": "90106729"}, {"name": "Denbigh", "namecy": "Dinbych", "collection": "57872648"}, {"name": "Carmarthen", "namecy": "Caerfyrddin", "collection": "25638567"}, {"name": "Cardigan", "namecy": "Ceredigion", "collection": "93404486"}, {"name": "Caernarfon", "namecy": "Caernarfon", "collection": "61170405"}, {"name": "Brecknock", "namecy": "Brycheiniog", "collection": "28936324"}, {"name": "Anglesey", "namecy": "Môn", "collection": "96702243"}];

  this.URL_STATS = 'http://earth.georeferencer.com/';

  this.queryData = {
    period: 'total',
    collection: this.parseHash(),
    limit: 10
  };

  var self = this;

  //draw map
  this.loadMap(basePath + '/js/counties.topojson');
  //load data
  this.loadData(this.queryData);

  //filter's handlers
  document.getElementById('cws-filter-all').onclick = function() {
    self.renderContent_('all');
    self.setQueryData({
      'collection': null,
      'period': document.getElementById('cws-filter-period').value
    });
    return false;
  };
  document.getElementById('cws-filter-my').onclick = function() {
    self.renderContent_('user');
    self.loadUser();
    return false;
  };
  document.getElementById('cws-filter-county').onclick = function() {
    //TODO: if county not selected display warning message
    self.renderContent_('county');
    return false;
  };
  document.getElementById('cws-filter-period').onchange = function() {
    self.setQueryData({
      'period': this.value
    });
    return false;
  };
};

/**
 * Sets query data a runs loading
 * @param {Objct} queryData
 */
Contributors.prototype.setQueryData = function(queryData) {
  if (queryData.collection) {
    this.queryData.collection = queryData.collection;
  }else if( queryData.collection === null){
    this.queryData.collection = null;
  }
  if (queryData.limit) {
    this.queryData.limit = queryData.limit;
  }
  if (queryData.period) {
    this.queryData.period = queryData.period;
  }
  this.loadData(this.queryData);
};

/**
 * Parse county from hash
 * @returns {Object}
 */
Contributors.prototype.parseHash = function() {
  var hash = decodeURIComponent(document.location.hash);

  if (hash) {
    var results;
    var county = hash.substring(1);
    var collection = null;
    for (var i = 0; i < this.counties.length; i++) {
      if (this.counties[i].name === county || this.counties[i].namecy === county) {
        collection = this.counties[i].collection;
        break;
      }
    }
    if (collection !== null) {
      results = {
        'id': collection,
        'County': county
      };
    } else {
      results = null;
    }
  } else {
    results = null;
  }
  return results;
};

/**
 * Creates url from data and runs visualisation
 * @param {Object} data
 */
Contributors.prototype.loadData = function(data) {
  var query = '?limit=' + data.limit;
  if (data.period) {
    query += '&period=' + data.period;
  }
  var url = this.URL_STATS;
  if (data.collection === null) {
    url += 'repository/15872231/top-contributors.json';
  } else {
    url += 'collection/' + data.collection.id + '/top-contributors.json';
  }
  this.drawVisualization(url + query);
};

/**
 * Filter ux control
 * @param {string} filter
 */
Contributors.prototype.renderContent_ = function(filter) {
  document.getElementById('cws-filter-all').className = '';
  document.getElementById('cws-filter-my').className = '';
  document.getElementById('cws-filter-county').className = '';
  var filterPeriod = document.getElementById('cws-filter-period');

  var blockMy = document.getElementById('cws-my');
  var blockWidgets = document.getElementById('cws-widgets');
  switch (filter) {
    case 'my':
      document.getElementById('cws-filter-my').className = 'active';
      filterPeriod.style.display = 'none';
      blockMy.style.display = 'block';
      blockWidgets.style.display = 'none';
      break;
    case 'county':
      document.getElementById('cws-filter-county').className = 'active';
      filterPeriod.style.display = 'block';
      blockMy.style.display = 'none';
      blockWidgets.style.display = 'block';
      break;
    case 'all':
      document.getElementById('cws-filter-all').className = 'active';
      filterPeriod.style.display = 'block';
      blockMy.style.display = 'none';
      blockWidgets.style.display = 'block';
      break;
  }
};

/**
 * Loads user stats
 */
Contributors.prototype.loadUser = function() {
  this.renderContent_('my');
  document.getElementById('cws-filter-period').style.display = 'none';
  document.getElementById('cws-my').style.display = 'block';
  var url = 'http://cynefin.georeferencer.com/person/current/contributions.json';
  ajax(url, function(resp) {
    var data = JSON.parse(resp);
    var contrib = data.contributions;
    var month = 0, week = 0, day = 0;
    var score = 0;
    for (var i = 0; i < contrib.length; i++) {
      if (contrib[i].period === 'month') {
        month++;
      } else if (contrib[i].period === 'week') {
        week++;
      } else if (contrib[i].period === 'day') {
        day++;
      }
      score += contrib[i].score;
    }
    document.getElementById('cws-my-score').innerHTML = score;
    document.getElementById('cws-my-total').innerHTML = contrib.length;
    document.getElementById('cws-my-month').innerHTML = month;
    document.getElementById('cws-my-week').innerHTML = week;
    document.getElementById('cws-my-day').innerHTML = day;
  }, function() {
    document.getElementById('cws-my').style.display = 'none';
    document.getElementById('cws-my-error').style.display = 'block';
  });
};

/**
 * Draw table and chart from data
 * @param {string} dataSourceUrl
 */
Contributors.prototype.drawVisualization = function(dataSourceUrl) {
  var pieContainer = document.getElementById('cws-pie');
  var pie = new google.visualization.PieChart(pieContainer);
  var tableContainer = document.getElementById('cws-table');
  var table = new google.visualization.Table(tableContainer);
  var query = new google.visualization.Query(dataSourceUrl);
  query.send(function(response) {
    if (response.isError()) {
      throw Error(response.getMessage() + ' ' + response.getDetailedMessage());
    } else {
      var dataTable = response.getDataTable();
      pie.draw(dataTable, {
        'legend': {
          textStyle: {color: 'black', fontName: '"Arial"', fontSize: 11}
        },
        'width': 450,
        'height': 250,
        'is3D': false,
        'backgroundColor': 'transparent',
        'chartArea.left': 0
      }
      );
      table.draw(dataTable, {showRowNumber: true});
    }
  });
};

/**
 * Load SVG map via 3djs
 * @param datajson
 */
Contributors.prototype.loadMap = function(datajson) {
  //Map dimensions (in pixels)
  var width = 482 / 2, height = 536 / 2;
  //Map projection
  var projection = d3.geo.mercator()
          .scale(8685.203500957907 / 2)
          .center([-4.160270073787833, 52.41566130468677]) //projection center
          .translate([width / 2, height / 2]); //translate to center the map in view

  //Generate paths based on projection
  var path = d3.geo.path()
          .projection(projection);
  //Create an SVG
  var svg = d3.select('#cws-map').append('svg')
          .attr('width', width)
          .attr('height', height);
  //Group for the map features
  var features = svg.append('g')
          .attr('class', 'features');
  //Create a tooltip, hidden at the start
  var tooltip = d3.select('#cws-map').append('div').attr('class', 'tooltip');

  var self = this;
  d3.json(datajson, function(error, geodata) {
    if (error)
      return console.log(error); //unknown error, check the console

    //Create a path for each map feature in the data
    features.selectAll('path')
            .data(topojson.feature(geodata, geodata.objects.collection).features) //generate features from TopoJSON
            .enter()
            .append('path')
            .attr('d', path)
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip)
            .on('click', function(feature, i) {

              var attr = feature.properties;
              self.setQueryData({'collection': {
                  'id': attr.Collection,
                  'County': attr.County
                }});
              self.renderContent_('county');
              var countyFilter = document.getElementById('cws-filter-county');
              countyFilter.innerHTML = attr.County;
              document.location.hash = encodeURIComponent(attr.County);
            });
  });
  //Position of the tooltip relative to the cursor
  var tooltipOffset = {x: -250, y: -300};
  //Create a tooltip, hidden at the start
  function showTooltip(d) {
    moveTooltip();
    tooltip.style('display', 'block')
            .text(d.properties.County);
  }

  //Move the tooltip to track the mouse
  function moveTooltip() {
    tooltip.style('top', (d3.event.pageY + tooltipOffset.y) + 'px')
            .style('left', (d3.event.pageX + tooltipOffset.x) + 'px');
  }

  //Create a tooltip, hidden at the start
  function hideTooltip() {
    tooltip.style('display', 'none');
  }
};

/**
 * Ajax request
 * @param {string} url
 * @param {function} callback
 */
function ajax(url, callback, errorcallback) {
  if (window.XMLHttpRequest) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback(xhr.responseText);
        } else {
          errorcallback();
        }
      }
    };
    xhr.open('GET', url, true);
    xhr.withCredentials = true;
    xhr.send();
  }
}