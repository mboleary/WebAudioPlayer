/**
 * Loads audio from a github repo based on a schema
 */

const ORIGIN = "https://raw.githubusercontent.com";

function main() {
    genURLGenerator();
    let params = (new URL(document.location)).searchParams;
    let schemaLoc = params.get('s');
    if (schemaLoc) {
        if (schemaLoc.indexOf(ORIGIN) === 0) {
            loadSchema(schemaLoc);
        } else {
            loadSchema(ORIGIN + schemaLoc);
        }
        hideBuilder();
    }
}

main();

function genURLGenerator() {
    let input = document.querySelector("#schemaURL");
    let btn = document.querySelector("#schemaURLGen");
    let p = document.querySelector("#genURL");

    btn.addEventListener('click', () => {
        let urlTemp = input.value;
        if (urlTemp.indexOf(ORIGIN) === 0) {
            p.innerText = `${window.location.origin}${window.location.pathname}?s=${urlTemp}`;
        } else {
            console.log(urlTemp);
            p.innerText = "Error: Unknown Origin"
        }
    });
}

function setUpPlayListener() {
    let audioElems = document.querySelectorAll("audio");
    function handler(e) {
        console.log("Play Event", e);
        for (const el of audioElems.values()) {
            if (el !== e.target) {
                el.pause();
            }
        }
    }
    for (const elem of audioElems.values()) {
        elem.addEventListener("play", handler);
    }
}

async function loadSchema(url) {
    let schemaResponse = await fetch(url, {
    });
    let schema = await schemaResponse.json();

    let urlSplit = url.replace(ORIGIN, "").split("/");

    console.log(urlSplit);

    const ghInfo = {
        userName: urlSplit[1],
        repoName: urlSplit[2],
        branchName: urlSplit[3]
    };

    setTitle(schema.title);
    setDescription(schema.description.text);

    let frag = document.createDocumentFragment();

    for (const trk of schema.tracks) {
        let temp = buildTrack(trk, ghInfo);
        frag.appendChild(temp);
    }

    document.body.appendChild(frag);

    setUpPlayListener();
}

function hideBuilder() {
    let builder = document.querySelector("#builder");
    if (builder) {
        builder.hidden = true;
    }
}

// Sets the title of the document
function setTitle(title) {
    let h1 = document.createElement('h1');
    h1.innerText = title;
    document.body.appendChild(h1);
}

// Sets the description of the document
function setDescription(desc) {
    let div = document.createElement('div');
    div.innerText = desc;
    document.body.appendChild(div);
}

function getAudioURL(url, ghInfo) {
    if (url.indexOf(ORIGIN) === 0) {
        return url;
    }
    if (url.indexOf("/") === 0) {
        return `${ORIGIN}/${ghInfo.userName}/${ghInfo.repoName}/${ghInfo.branchName}`;
    }
    return `${ORIGIN}/${ghInfo.userName}/${ghInfo.repoName}/${ghInfo.branchName}/`;
}

function buildTrack(trackObj, ghInfo) {
    let divContain = document.createElement('div');
    let h3 = document.createElement('h3');
    let div = document.createElement('div');
    let audio = document.createElement('audio');

    h3.innerText = trackObj.title;
    div.innerText = trackObj.description.text;

    audio.src = getAudioURL(trackObj.src, ghInfo);
    audio.controls = true;

    if (trackObj.loop) {
        audio.loop = true;
    }
    if (trackObj.autoplay) {
        audio.autoplay = true;
    }

    divContain.appendChild(h3);
    divContain.appendChild(div);
    divContain.appendChild(audio);

    return divContain;
}