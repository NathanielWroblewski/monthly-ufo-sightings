!function() {

  d3.csv('/monthly-ufo-sightings/public/datasets/sightings.csv', function(dataset) {
    var toDate = function(string) {
      return d3.time.format('%m/%Y').parse(string)
    }

    var counts = dataset.map(function(datum) {
      return +datum.count
    })
    var dates = dataset.map(function(datum) {
      return toDate(datum.month)
    })
    var total = counts.length

    var countExtent = d3.extent(counts)
      , dateExtent  = d3.extent(dates)

    var yscale = d3.scale.linear()
      .domain(countExtent)
      .range([0,300])

    var xscale = d3.time.scale()
      .domain(dateExtent)
      .range([20,780])

    d3.select('svg').selectAll('rect')
      .data(dataset)
      .enter().append('rect')
      .attr('width', '3')
      .attr('data-count', function(datum) { return +datum.count })
      .attr('data-month', function(datum) { return datum.month })
      .attr('class', function(datum) { return d3.time.format('%b')(toDate(datum.month)) })
      .attr('transform', function(datum, index) {
        return 'translate(' + xscale(toDate(datum.month)) + ',' + 380 + ')'
      })
      .attr('height', '0')
      .transition()
      .each('end', function(datum, index) {
        var x = xscale(toDate(datum.month))
          , y = 380 - yscale(datum.count)

        return d3.select(this)
          .transition().ease('back-out').delay((total - index) * 4).duration(1000)
          .attr('transform', 'translate(' + x + ',' + y + ')')
          .attr('height', yscale(datum.count))
      })

    d3.select('svg').append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,380)')
      .call(d3.svg.axis().ticks(5).orient('bottom').scale(xscale))

    var showTooltip = function(datum) {
      var count = datum.dataset.count
        , month = datum.dataset.month

      d3.select('.tooltip-container')
        .style('visibility', 'visible')
        .select('.tooltip')
          .html(tooltipTemplate({ month: month, count: count }))
    }

    var moveTooltip = function() {
      d3.select('.tooltip-container')
        .style('top',  (event.pageY - 50) + 'px')
        .style('left', (event.pageX + 30) + 'px')
    }

    var tooltipTemplate = function(attrs) {
      return(
        '<p>' +
          attrs.month +
          '<span class="count">' + attrs.count + '</span>' +
          'sightings' +
        '</p>'
      )
    }

    var hideTooltip = function() {
      d3.select('.tooltip-container').style('visibility', 'hidden')
    }

    d3.selectAll('rect').on('mouseenter', function() {
      d3.select(this).transition().duration(100).style('opacity', '0.5')
      showTooltip(this)
    })

    d3.selectAll('rect').on('mouseleave', function() {
      d3.select(this).transition().duration(100).style('opacity', '1')
      hideTooltip(this)
    })

    d3.selectAll('rect').on('mousemove', moveTooltip)
  })
}()
