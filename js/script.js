
let currentSong = new Audio();
let songs;
let currentFolder = "fs";

//Get Songs 
async function getSongs(folder){
    let a = await fetch(`songs/${folder}`);
    let fetched =  await a.text();

    let div = document.createElement('div');
    div.innerHTML = fetched;
    let links = div.getElementsByTagName('a');

    let songs = []
    for (let i = 0; i < links.length; i++) {
        if(links[i].href.endsWith("mp3")){
            // let song = links[i].href.split("songs/")[1].split(".mp3")[0];
            // songs.push(song.replaceAll("%20"," "));
            songs.push(links[i].text.split(".mp3")[0]);
        }
    }
    
    return songs
}

//Load the Song Library
async function getLibrary(songs){

    let song = document.getElementById('songs');
    song.innerHTML =""
    songs.forEach(e => {
        song.innerHTML += `<li class="flex">
                            <div class="song">
                                <img src="assets/music.svg" alt="music" width="30" height="30">
                            </div>
                            <div class="title">${e}</div>
                            <div class="plybtn">
                                <img src="assets/ply.svg" alt="play" width="30" height="30">
                            </div>
                        </li>`;
    });


}

//Play and Pause Audio
async function playAudio(audio){

    if(audio.paused){
        audio.play();
        document.getElementById("play-pause").getElementsByTagName("img")[0].src = "assets/pause.svg";
    }
    else{
        audio.pause();
        document.getElementById("play-pause").getElementsByTagName("img")[0].src = "assets/playaudio.svg";
    }  
    
}

//convertSecondsToMinutes
function convertSecondsToMinutes(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    if(remainingSeconds<10)
        remainingSeconds = "0" + remainingSeconds;
    if(minutes<10)
        minutes = "0" + minutes;

    return `${(minutes)}:${remainingSeconds}`;//.toString().padStart(2, '0')}`;
}

//Load the Playlist of song
async function getPlaylist(){

    let a = await fetch(`songs/`);
    let fetched =  await a.text();

    let div = document.createElement('div');
    div.innerHTML = fetched;
    let links = div.getElementsByTagName('a');

    for (let i = 0; i < links.length; i++) {

        if(links[i].href.includes('songs/')){
            let s = links[i].href.split('songs/')[1];
            let folder = decodeURI(s.replace('/',''));
    
            let b = await fetch(`songs/${folder}/info.json`)
            let info = await b.json();
            
            document.querySelector('.card-container').innerHTML += `
                            <div class="card flex" data-folder="${folder}">
                                <div class="img">
                                    <img src="songs/${folder}/cover.jpg" alt="Album Image" width="200" height="200">
                                </div>
                                <div class="title">${info.title}</div>
                                <div class="artist">${info.artist}</div>
                                <div class="play">
                                    <img src="assets/play.svg" alt="playbutton" width="50" height="50">
                                </div>
                            </div>`;
        }
    }

}

//Main Code Running
async function main(){

    //Get all Playlists
    await getPlaylist();

    // Get all Songs
    songs = await getSongs(currentFolder);

    //Load Library
    getLibrary(songs);

    //Default song
    currentSong.src = "songs/"+currentFolder+'/'+songs[0]+".mp3";

    //Load Default song Name
    let songName = document.querySelector('.songName');
    songName.innerHTML = currentSong.src.split('/')[currentSong.src.split('/').length-1].replaceAll('%20'," ").split('.mp3')[0];


    //Song Play Pause Event
    document.getElementById("play-pause").addEventListener("click",async e =>{

        playAudio(currentSong);
        
    })


    //An Event Listener for Playing Song Details
    currentSong.addEventListener("timeupdate", (e) => {

        let songName = document.querySelector('.songName');
        songName.innerHTML = currentSong.src.split('/')[currentSong.src.split('/').length-1].replaceAll('%20'," ").split('.mp3')[0];

        let songTime = document.querySelector('.songTime');
        songTime.innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)}/${convertSecondsToMinutes(currentSong.duration)}`;

        let circle = document.querySelector(".circle");
        circle.style.left = `${((currentSong.currentTime/currentSong.duration)*100)-0.5}%`; 

        if(currentSong.currentTime == currentSong.duration){
            
            let songName = currentSong.src.split('/');
            songName = decodeURI(songName[songName.length-1].split('.mp3')[0]);

            let songIndex = songs.indexOf(songName); 

            if(songIndex < songs.length - 1){
                currentSong.src = "songs/" + currentFolder + '/' + songs[songIndex+1] + ".mp3";
                playAudio(currentSong);
            }
            else{
                currentSong.pause();
                document.getElementById("play-pause").getElementsByTagName("img")[0].src = "assets/playaudio.svg";
            }  
            
        }
            
    });
        
    // An Event Listener for Change Song Time
    let seekbar = document.querySelector('.seekbar');
    seekbar.addEventListener('click',e =>{
        
        let offsetPercent = `${((e.offsetX/seekbar.offsetWidth)*100)-0.5}`; 
        
        let circle = document.querySelector(".circle");
        circle.style.left = offsetPercent; 

        // currentSong.currentTime = (currentSong.duration*offsetPercent)/100;

        let onePercent = currentSong.duration/100;
        let currentTimePercent = `${((currentSong.currentTime/currentSong.duration)*100)-0.5}`;

        let changedTime = (offsetPercent - currentTimePercent)*onePercent;

        currentSong.currentTime += changedTime;
       
    })

    //An Event Listener for circle
    document.querySelector('.circle').addEventListener('click',e =>{ 
        e.stopPropagation();
    })
    //An Event Listener for Play previous song
    document.querySelector('.previous').addEventListener('click',e =>{
        let songName = currentSong.src.split('/');
        songName = decodeURI(songName[songName.length-1].split('.mp3')[0]);

        let songIndex = songs.indexOf(songName); 

        if(songIndex > 0){
            currentSong.src = "songs/" + currentFolder + '/' + songs[songIndex-1] + ".mp3";
            playAudio(currentSong)
        }
    })

    //An Event Listener for Play next song
    document.querySelector('.forward').addEventListener('click',e =>{
        let songName = currentSong.src.split('/');
        songName = decodeURI(songName[songName.length-1].split('.mp3')[0]);

        let songIndex = songs.indexOf(songName); 

        if(songIndex < songs.length - 1){
            currentSong.src = "songs/" + currentFolder + '/' + songs[songIndex+1] + ".mp3";
            playAudio(currentSong)
        }    
    })
    
    //An Event listener for hamburger
    document.querySelector('.hamburger').addEventListener('click', e =>{
        e.stopPropagation();
        document.querySelector('.left').style.left = "0%";
    })
    
    //An Event listener for close
    document.querySelector('.close').addEventListener('click', e =>{
        
        document.querySelector('.left').style.left = "-100%";
    })

    //An event listener for volume 
    document.querySelector('.vol-range').addEventListener('change',e =>{
        
        currentSong.volume = parseInt(e.target.value)/100;
        if(e.target.value == "0")
            document.querySelector('.vol').src = "assets/volumeoff.svg";
        else
            document.querySelector('.vol').src = "assets/volumeon.svg";    
    })

    //An event listener for mute volume
    document.querySelector('.vol').addEventListener('click',e=>{
        if(document.querySelector('.vol').src.toString().endsWith("assets/volumeoff.svg")){
            document.querySelector('.vol').src = "assets/volumeon.svg";   
            currentSong.volume = 1; 
            document.querySelector('.vol-range').value = "100";

        }
        else{
            document.querySelector('.vol').src = "assets/volumeoff.svg";    
            currentSong.volume = 0;
            document.querySelector('.vol-range').value = "0";
        }
    })
    
    //An event for hamburger
    document.querySelector('.right').addEventListener('click',e=>{
        
        if(document.body.offsetWidth<=1000){
            document.querySelector('.left').style.left = "-100%";            
        }
        
    })

    //An event for playlist
    document.querySelectorAll(".card").forEach(e=>{

        e.addEventListener('click',async es=>{
            //Update Folder(Library)
            currentFolder = es.currentTarget.dataset.folder;
             // Get all Songs
            songs = await getSongs(currentFolder);

            //Default song
            currentSong.src = "songs/"+currentFolder+'/'+songs[0]+".mp3";

            //Load Library
            getLibrary(songs);

            //Play Default song
            playAudio(currentSong);

                //An Event Listener for Play particular Song
    document.getElementById('songs').querySelectorAll(".flex").forEach(element => {

        let title = element.querySelector('.title').textContent;
        
        element.addEventListener('click',e=>{

            currentSong.src = "songs/"+currentFolder+'/'+title+".mp3";

            playAudio(currentSong);
            
        })
    });

            
        })
        
    })
}

main()


