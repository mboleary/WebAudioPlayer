/**
 * Loads audio from a github repo based on a schema
 */

const ORIGIN = "https://raw.githubusercontent.com";

function main() {
    genURLGenerator();
    let params = (new URL(document.location)).searchParams;
    let schemaLoc = params.get('s');
    if (schemaLoc) {
        loadSchema(schemaLoc);
        // if (schemaLoc.indexOf(ORIGIN) === 0) {
        //     loadSchema(schemaLoc);
        // } else {
        //     loadSchema(ORIGIN + schemaLoc);
        // }
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
        p.innerText = `${window.location.origin}${window.location.pathname}?s=${urlTemp}`;
        // if (urlTemp.indexOf(ORIGIN) === 0) {
        //     p.innerText = `${window.location.origin}${window.location.pathname}?s=${urlTemp}`;
        // } else {
        //     console.log(urlTemp);
        //     p.innerText = "Error: Unknown Origin"
        // }
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
    setDescription(await getDescription(schema.description));

    let frag = document.createDocumentFragment();

    let h2 = document.createElement("h2");
    h2.innerText = "Tracks";
    h2.classList.add("hbar");

    frag.appendChild(h2);

    for (const trk of schema.tracks) {
        let temp = await buildTrack(trk, ghInfo);
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
    div.innerHTML = desc;
    document.body.appendChild(div);
}

async function getDescription(obj) {
    // Priority: HTTP, Markdown, Text
    let isMd = false;
    let content = "";
    if (obj.url) {
        try {
            let resp = await fetch(obj.url);
            if (resp.ok) {
                content = await resp.text();
                if (obj.url.indexOf(".md") === obj.url.length - 3) {
                    isMd = true;
                }
            } else {
                console.warn("Request not ok:", resp);
                content = "";
            }
        } catch (err) {
            console.warn("Error:", err);
        }
    }

    if (!content) {
        if (obj.md) {
            isMd = true;
            content = obj.md;
        } else {
            content = obj.text;
        }
    }

    console.log("Content:", content, isMd);

    if (isMd && window.showdown) {
        let converter = new window.showdown.Converter();
        let html = converter.makeHtml(content);
        console.log(html);
        return html;
    }
    return content;
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

async function buildTrack(trackObj, ghInfo) {
    let divContain = document.createElement('div');
    let h3 = document.createElement('h3');
    let div = document.createElement('div');
    let audio = document.createElement('audio');

    h3.innerText = trackObj.title;
    div.innerHTML = await getDescription(trackObj.description);

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