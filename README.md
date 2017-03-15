# MMM-nominalflight
A module for MagicMirror2 that displays upcoming space launches.

![screen shot 2017-03-14 at 11 27 49 pm](https://cloud.githubusercontent.com/assets/2536200/23936948/1b91c606-0912-11e7-81b8-01c6315d7a18.png)


## Dependencies
  * A [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror) installation


## Installation
  1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/jstuder/MMM-nominalflight.git`
  2. Create an entry in your `config.js` file to tell this module where to display on screen.
  
 **Example:**
```
 {
    module: 'MMM-peopleinspace',
	position: 'top_left', // you may choose any location
	header: 'People in Space'
	config: {
		launches : 5,
	}
 },
```

## Config
| **Option** | **Description** |
| --- | --- |
| `launches` | Set number of launches to display, default is 5, max is 20. |
