function socialInput(username) {
	getFriend(username);
}

var tempPlaylist;

$(function(){
	var hatelist,
		drop = document.querySelector('#friend-drop'),
		listlength;
	drop.addEventListener('dragenter', handleDragEnter, false);
	drop.addEventListener('dragover', handleDragOver, false);
	drop.addEventListener('dragleave', handleDragLeave, false);
	drop.addEventListener('drop', handleDrop, false);

	function handleDragEnter(e) {
		this.style.background = 'url(/img/hover.gif)';
	}
	
	function handleDragOver(e) {
		e.preventDefault();
		//e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
		return false;
	}

	function handleDragLeave(e) {
		this.style.background = 'url(/img/before.gif)';
	}
	
	function handleDrop(e) {
		this.style.background = 'url(/img/after.gif)';
		var uri = e.dataTransfer.getData('Text');
		if(uri.split(":")[1]=="user") {
			if (hatelist != undefined){
				var user = uri.split(":")[2];
				console.log(user);
				matchingTopListSongs(hatelist, user, function(matches){
					console.log(matches.length);
					console.log(matches);
					console.log(listlength);
					var hate = Math.round((matches.length/listlength)*150);
					if(hate>10){
					  $('#added').html('<p class="yea">Your hatelevel:</p><p id="match">'+hate+'</p><p class="yea">UNFRIEND NOW KK?</p>');
					  player.play('spotify:track:5st5644IlBmKiiRE73UsoZ#1:38', '', 0);
					}else{
					  $('#added').html('<p class="yea">Your hatelevel:</p><p id="match">'+hate+'</p><p class="yea">PURE LOVE!</p>');
					  player.play('spotify:track:4nUYyFHStGtQlSQYcQVljy#0:25', '', 0);
					}
				});
			}
		}else{
			var playlist = models.Playlist.fromURI(uri);
			hatelist = playlist.tracks;
			console.log('playlist: ', playlist)
			$('#instruction').after('<p class="yea" id="added">Your hatelist with ' + playlist.tracks.length + (playlist.tracks.length > 1 ? ' songs' : ' song') + ' was added.</p>');
			
			listlength = playlist.tracks.length;

			$.each(playlist.tracks,function(index,track){
				console.log(track.artists[0].name);

			});

			setTimeout(function() {
				$('#instruction').text('Drop your friends here');
			}, 1000);
		}
	}

});

function matchingTopListSongs(compare_tracks, username, callback) {
	var toplist = new models.Toplist();	
	toplist.userName = username;	
	toplist.matchType = models.TOPLISTMATCHES.TRACKS;
	toplist.observe(models.EVENT.CHANGE, function() {
        num_matches = 0;
        matches = [];
        for (i=0; i<toplist.results.length; i++) {
			console.log(toplist.results[i].artists[0].name);
            for (j=0; j<compare_tracks.length; j++) {
                if (toplist.results[i].artists[0].name == compare_tracks[j].artists[0].name) {
					matches.push(compare_tracks[j]);
                }
            }
        }
        callback(matches);
	});
	toplist.run();
}

function getFriend(username) {
	var toplist = new models.Toplist();	
	toplist.userName = username;	
	toplist.matchType = models.TOPLISTMATCHES.TRACKS;	// ALBUMS doesn't work!
	toplist.observe(models.EVENT.CHANGE, function() {
        cb = function(matches) {
            console.log('matches', matches);
        }
        matchingTopListSongs([], username, cb);
        //showFriend(username, toplist.results);
	});
	toplist.observe(models.EVENT.LOAD_ERROR, function() {
		$("#friend-title").html(username+"'s Top Tracks");
		$("#friend-tracks").html("<p>What a drag! Looks like "+username+" isn't sharing their music :(</p>");
	});
	toplist.run();
}

function showFriend(username,tracks) {
    console.log('zzzzzzzzzzzzzzzz');
    console.log(tracks);

	$("#friend-title").html(username+"'s Top Tracks");
	$("#friend-tracks").empty();
	tempPlaylist = new models.Playlist();
	$.each(tracks,function(num,track){
		tempPlaylist.add(models.Track.fromURI(track.uri));
	});	
	var playlistList = new views.List(tempPlaylist);
		playlistList.node.classList.add("temporary");
		$("#friend-tracks").append(playlistList.node);
}
