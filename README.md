# LaMetric Transportation API
> Get your next bus on your LaMetric connected clock !

## Getting Started
### Using as client
- Download app 'Buses schedules' on your LaMetric app
- Please refer to the Wiki page corresponding to your network to choose the right stop code and route code
- Configure your app with these codes
- Wait a bit and the magic happens !

## Running your own server
Clone this repo then:  
``` bash
npm install -g forever
cd lametric-transports
npm install
forever server.js
```
Tada! Your server is reachable on [`localhost:6789`](http://localhost:6789). If you go to this URL you should see `Lametric Grenoble`  
To really test it simply pass `stopId` & `route` as parameters (see Wiki pages for these codes).  
For exemple try [`http://localhost:6789?stopId=SEM:GENCHAVANT&route=SEM:C`](http://localhost:6789?stopId=SEM:GENCHAVANT&route=SEM:C).  
You should see something like this:
``` json
{
    "frames": [{
        "text": "Plaine des Sports",
        "icon": "a4875"
    }, {
        "text": "2m  7m"
    }, {
        "text": "Le Prisme",
        "icon": "a4875"
    }, {
        "text": "3m  ..."
    }]
}

```
## Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.
## Licensing
The code in this project is licensed under MIT license. See [LICENSE](LICENSE) for more details
