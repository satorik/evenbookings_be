import React from 'react';
import { Bar } from 'react-chartjs';

const BOOKINGS_BUCKETS = {
  'Cheap': {
    min: 0,
    max: 100,
    pos: 0
  },
  'Normal': {
    min: 100,
    max: 200,
    pos: 1
  },
  'Expensive': {
    min: 200,
    max: 10000000000,
    pos: 2
  }
}

const BookingsChart = (props) => {
  const chartData = {labels: [], datasets: []};
  for (const bucket in BOOKINGS_BUCKETS) {
    let values = Array(3).fill('');
    const filteredBookingsCount = props.bookings.reduce((prev, current) => {
      if ( current.event.price > BOOKINGS_BUCKETS[bucket].min && current.event.price < BOOKINGS_BUCKETS[bucket].max)
       {
         return prev + 1
      }
      else {
        return prev;
      }
    }, 0);
    values.splice(BOOKINGS_BUCKETS[bucket].pos, 1, filteredBookingsCount);
    chartData.labels.push(bucket);
    chartData.datasets.push({
      fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data: values
    });
  }

  const options = {
    scaleShowGridLines : false
  }
  console.log(chartData);


  return <div style={{textAlign: 'center'}}><Bar data={chartData} options={options}/></div>
}

export default BookingsChart;
