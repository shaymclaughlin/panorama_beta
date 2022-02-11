let panoramaDetailsPanel = document.querySelector(".panorama-details-panel")
let panoramaDetailsTitle = document.querySelector(".panorama-details-panel .pdp-title")
let panoramaDetailsContent = document.querySelector(".panorama-details-panel .pdp-content")
let panoramaDetailsBtn = document.querySelector(".panorama-details-panel .pdp-btn")
panoramaDetailsPanel.style.visibility = "hidden"
var allHotspotsData = [
    {
        name: "hotspots",
        data: [],
    },
    {
        name: "hotspots2",
        data: [],
    }
]
var allHotspots = []
let readFile = async function(file) {    
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var text = rawFile.responseText;
                return text
            }
        }
    }
    rawFile.send(null);
}
async function getJson(file) {
    let response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
}
async function init() {
    for (let i = 0;i<allHotspotsData.length;i++) {
        let fileDir = `../data/hotspots/${allHotspotsData[i].name}.json`;
        await getJson(fileDir).then((text) => {
            allHotspotsData[i].data = JSON.parse(text)
            allHotspotsData[i].data.map(o => o["createTooltipFunc"] = hotspot)
            allHotspotsData[i].data.map(o => o["clickHandlerFunc"] = getDetails)//cssClass
            allHotspotsData[i].data.map(o => o["cssClass"] = "custom-hotspot")//
        })        
    }
    for (let i = 0;i<allHotspotsData.length;i++) {
        allHotspots = allHotspots.concat(allHotspotsData[i].data)
    }
    allHotspots.map((element,index) => element["createTooltipArgs"] = index)
    allHotspots.map((element,index) => element["clickHandlerArgs"] = index)
    let options = {
        "default": {
            "firstScene": "scene1",
            "author": "Shay McLaughlin",
            "autoLoad": true
        },//Rapid Prototyping Lab 
        "scenes": {
            "scene1": {
                "title": "Room 1",
                "type": "equirectangular",
                "panorama": "images/360example.jpeg",
                "hotSpots": getHotspotArray("hotspots")
            },
            "scene2": {
                "title": "Room 2",
                "type": "equirectangular",
                "panorama": "images/360example2.jpeg",
                "hotSpots": getHotspotArray("hotspots2")
            }
        }
    }
    await viewerStart(options);
    accessibilitySecondary(options);
    /*allHotspots = rplSceneHotspots.concat(rplSceneHotspots2)
    console.log(testArr,allHotspots)
    allHotspots.map((element,index) => element["createTooltipArgs"] = index)
    allHotspots.map((element,index) => element["clickHandlerArgs"] = index)*/
}
var viewer;
async function viewerStart(options) {
    viewer = pannellum.viewer('panorama',options);
    viewer.on('mousedown', function(event) {
        // coords[0] is pitch, coords[1] is yaw
        var coords = viewer.mouseEventToCoords(event);
        console.log(coords)
    });
}
function viewerMove(pitch,yaw) {
    viewer.setPitch(parseInt(pitch));
    viewer.setYaw(parseInt(yaw));

}
// pannellum
function getDetails(hotSpotDiv, args) {
    let hs = getHotspot(args);
    console.log(allHotspots)
    if (hs["sceneId"]) {
        closeDetailsPanel();
        return
    }
    console.log(hs.text,panoramaDetailsTitle.innerText)
    if (panoramaDetailsPanel.style.visibility === "hidden") {
        panoramaDetailsPanel.style.visibility = "visible"
        panoramaDetailsPanel.style.right = "0px"
        panoramaDetailsPanel.style.opacity = "1"
        addDetailsContent(hs)
        
    } else {
        if (hs.text === panoramaDetailsTitle.innerText) {
            closeDetailsPanel();
        }
        addDetailsContent(hs)
    }
}
/*<iframe width="560" height="315" src="https://www.youtube.com/embed/5BXdWXH6E-M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>*/
function addDetailsContent(hs) {
    let title = hs.text, content = hs.customDetails;
    let cytElContainer = document.querySelector(".pdp-yt-container")
    let imgElContainer = document.querySelector(".pdp-image-container")
    let linksEl = document.querySelector(".pdp-links-container")
    let linksWrapperEl = document.querySelector(".pdp-links-wrapper")
    // check if JSON/Object contains the customYoutube key, if so display and add source
    if (hs.customYoutube) {
        cytElContainer.style.display = "flex"
        let cytEl = document.querySelector(".pdp-yt-iframe")
        let vidId = youtube_parser(hs.customYoutube);
        let ytEmbedLink = `https://www.youtube.com/embed/${vidId}`
        cytEl.src = ytEmbedLink
    }
    else {cytElContainer.style.display = "none"}
    // check if JSON/Object contains the customImage key, if so display and add source
    if (hs.customImage) {
        let imageEl = document.querySelector(".pdp-image")
        imageEl.src = hs.customImage
        imageEl.setAttribute("alt",`${content} Image`)
        imgElContainer.style.display = "flex"
    }
    else {imgElContainer.style.display = "none"}
    // check if JSON/Object contains the customLinks key, if so display and add source
    if (hs.customLinks && hs.customLinks.length > 0) {
        linksWrapperEl.style.display ="flex"
        linksEl.innerText = ""
        linksEl.style.display = "flex"
        for (let i = 0;i<hs.customLinks.length;i++) {
            let el = document.createElement("span")
            let a = document.createElement("a");
            a.href = hs.customLinks[i].url
            a.title = hs.customLinks[i].title
            a.innerText = hs.customLinks[i].title
            a.target = "_blank"
            el.appendChild(a)
            linksEl.appendChild(el)
        }
    }
    else {
        linksWrapperEl.style.display ="none"
        linksEl.style.display = "none"
    }
    panoramaDetailsTitle.innerText = title;
    panoramaDetailsContent.innerText = content;
}
function hotspot(hotSpotDiv, args) {
    hotSpotDiv.classList.add('custom-tooltip');
    let hs = getHotspot(args);
    console.log(hs)

    var wrapper = document.createElement('span');
    var divToggle = document.createElement('input');
    var titleEl = document.createElement('div');
    var detailsEl = document.createElement('div');
    var id = hs["createTooltipArgs"];
    divToggle.setAttribute("id",`checkboxToggle${id}`);
    divToggle.setAttribute("class","pannellum-hs-custom-checkboxtoggle")
    divToggle.setAttribute("type","checkbox")
    wrapper.setAttribute("class","pannellum-hs-custom-wrapper")
    titleEl.innerText = hs.text;
    titleEl.setAttribute("class","pannellum-hs-custom-title")
    detailsEl.innerText=hs.customDetails
    detailsEl.setAttribute("class","pannellum-hs-custom-details")
    detailsEl.setAttribute("id",`detailsBox${id}`)
    wrapper.appendChild(titleEl)
    hotSpotDiv.appendChild(wrapper);
    if ("sceneId" in hs) { 
        console.log('exit')
        hotSpotDiv.innerText = ""
        let elC = document.createElement("p");
        elC.innerText ="TeSTING" ;
        hotSpotDiv.appendChild(elC)
    }
    wrapper.style.width = wrapper.scrollWidth*2 - 20 + 'px';
    wrapper.style.marginLeft = -(wrapper.scrollWidth - hotSpotDiv.offsetWidth) / 2 + 'px';
    wrapper.style.marginTop = -wrapper.scrollHeight - 12 + 'px';    
}
function getHotspot(id) {
    var result = allHotspots.find(obj => {
        return obj["createTooltipArgs"] === id
      })
      return result
}
function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}
function getHotspotArray(name) {
    var result = allHotspotsData.find(obj => {
        return obj["name"] === name
      })
      return result.data
}
init();
panoramaDetailsBtn.addEventListener("click",function() {
    if (panoramaDetailsPanel.style.visibility === "hidden") {
        panoramaDetailsPanel.style.visibility = "visible"
        panoramaDetailsPanel.style.right = "0px"
    } else {
        closeDetailsPanel();
    }
})
function closeDetailsPanel() {
    panoramaDetailsPanel.style.right = "-100%"
    panoramaDetailsPanel.style.opacity = "0"
    panoramaDetailsPanel.style.visibility = "hidden"
}
function accessibilitySecondary(options) {
    let roomsData = options.scenes;
    let roomsKeys = Object.keys(roomsData);
    const panoramaMore = document.getElementById("panoramaMore");
    
    let sectionHeading = document.createElement("h3");
    let panoramaName = " ";
    sectionHeading.innerText = `${panoramaName} Features List`;
    panoramaMore.appendChild(sectionHeading)
    for (let i = 0;i<roomsKeys.length;i++) {
        //console.log(roomsData[roomsKeys[i]].hotSpots)
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class","pano-feature-list-container")
        let titleContainer = document.createElement("div");
        let titleHeading = document.createElement("h4");
        titleHeading.setAttribute("class","pfl-title")
        console.log(roomsData[roomsKeys[i]])
        let hotspotsName = roomsData[roomsKeys[i]].title;
        titleHeading.innerText = hotspotsName;
        let hotspots = roomsData[roomsKeys[i]].hotSpots
        titleContainer.appendChild(titleHeading)
        divContainer.appendChild(titleContainer)
        for (let j=0;j < hotspots.length;j++) {
            console.log(hotspots[j])
            let featureTitleText = hotspots[j].text;
            let featureContentText = hotspots[j].customDetails;
            let featureContainer = document.createElement("div");
            let featureTitleHeader = document.createElement("h5");
            featureTitleHeader.setAttribute("class","pfl-feature-title")
            featureTitleHeader.setAttribute("data-pitch",hotspots[j].pitch)
            featureTitleHeader.setAttribute("data-yaw",hotspots[j].yaw)
            let featureContentP = document.createElement("p");
            featureTitleHeader.innerText = featureTitleText;
            featureContentP.innerText = featureContentText;
            featureContainer.appendChild(featureTitleHeader);
            featureContainer.appendChild(featureContentP)
            divContainer.appendChild(featureContainer);

        }
        panoramaMore.appendChild(divContainer)

    }
    let pflTitles = document.getElementsByClassName("pfl-feature-title");
    for (let i=0;i<pflTitles.length;i++) {
        pflTitles[i].addEventListener("click",function() {
            //console.log(this.dataset.pitch,this.dataset.yaw) 
            viewerMove(this.dataset.pitch,this.dataset.yaw)        
            console.log(viewer.getScene())
        })
    }
}