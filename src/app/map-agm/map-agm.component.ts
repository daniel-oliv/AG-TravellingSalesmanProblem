import { Component, OnInit } from '@angular/core';

import { MouseEvent } from '@agm/core';

@Component({
  selector: 'app-map-agm',
  templateUrl: './map-agm.component.html',
  styleUrls: ['./map-agm.component.css']
})
export class MapAgmComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  zoom: number = 8;
  
  // initial center position for the map
  lat: number = -18.9128;
  lng: number = -48.2755;

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }
  
  mapClicked($event: MouseEvent) {
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: true
    });
  }
  
  markerDragEnd(m: marker, $event: MouseEvent) {
    m.lat = $event.coords.lat;
    m.lng = $event.coords.lng;
    console.log('dragEnd', m, $event);
    console.log('new ', $event.coords.lat);
  }
  
  markers: marker[] = [
	  {
		  lat: -18.5873,
		  lng: -46.5147,
		  label: 'A',
		  draggable: true
	  },
	  {
		  lat: -18.5873,
		  lng: -47.5147,
		  label: 'B',
		  draggable: false
	  },
	  {
		  lat: 51.723858,
		  lng: 7.895982,
		  label: 'C',
		  draggable: true
	  }
  ]

}

interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}
