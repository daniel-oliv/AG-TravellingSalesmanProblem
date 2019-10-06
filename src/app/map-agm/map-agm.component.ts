import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { MouseEvent } from '@agm/core';

@Component({
  selector: 'app-map-agm',
  templateUrl: './map-agm.component.html',
  styleUrls: ['./map-agm.component.css']
})
export class MapAgmComponent implements OnInit {

  @Output() newMarkers = new EventEmitter<any>();
  @Input() linesData: string;

  constructor() { }

  ngOnInit() {

    this.newMarkers.emit(this.markers);
  }

  nextLabel  = 5;

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
      label: this.nextLabel.toString(),
      draggable: true
    });
    this.nextLabel++;

    this.newMarkers.emit(this.markers);
  }
  
  markerDragEnd(m: marker, $event: MouseEvent) {
    m.lat = $event.coords.lat;
    m.lng = $event.coords.lng;
    //console.log('dragEnd', m, $event);
    //console.log('new ', $event.coords.lat);
    this.newMarkers.emit(this.markers);
  }
  
  markers: marker[] = [
	  {
		  lat: -18.5873,
		  lng: -46.5147,
		  label: '1',
		  draggable: true
	  },
	  {
		  lat: -18.9128,
		  lng: -48.2755,
		  label: '3',
		  draggable: false
	  },
	  {
		  lat: -18.7307,
		  lng: -47.4917,
		  label: '2',
		  draggable: true
    },
    {
		  lat: -19.5906,
		  lng: -46.9442,
		  label: '4',
		  draggable: true
	  }
  ]

}

declare interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}
