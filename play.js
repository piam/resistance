var good = 3;
var spy = 2;
var missionSizes = [2,3,2,3,3];
var maxVoteFails = 5;
var DEBUG = false;
function log(x) {
  if (DEBUG) {
    console.log(x);
  }
}
function History() {
  // missions successes and fails
  this.missionSuccesses = []; // e.g. [true, false];
  this.missionTeams = [];
  this.missionSucceeded = false;
  this.largestSuccessTeamIndex = null;
  this.currentMissionNum = function() {
    return this.missionSuccesses.length;
  }
}

function Player(isGood) {
  this.playerNum = 0; // will be changed later
  this.toString = function(){
    return "P" + this.playerNum + ":" + 
      (isGood ? "g" : "e");
  };
  
  // return an array of player indices, of
  // apprporiate size
  this.leaderChooseTeam = function(history) {
    var missNum = history.currentMissionNum();
    var size = missionSizes[missNum];
    var team = [];
    var playerIndices = [0, 1, 2, 3, 4];
    var start = 0;



    if (history.missionSucceeded) {

        //grab the last team from the prev mission
        var prevTeam = history.missionTeams[history.largestSuccessTeamIndex].slice();
        
        //if team is bigger remove last element
        if (prevTeam.length > size) {
          team = prevTeam.pop();
        }

        //if team is smaller add yourself, if you are included add another
        if (prevTeam.length < size) {
          var onTeam=false;
          //check for self on team, make array of players not on team
          for (var i=0; i < prevTeam.length; i++) {
            //splice out any player found on prevTeam from playerIndices
            var index = playerIndices.indexOf(prevTeam[i]);
            playerIndices.splice(index,1);

            if (prevTeam[i]==this.playerNum) {
              onTeam=true;
            }

          }
          //if you are on team add another player
          if (onTeam){
            newPlayer = playerIndices[0];
            team = prevTeam;
            team.push(newPlayer);
          }
          //else add yourself
          else {
            team = prevTeam.push(this.playerNum)
          }

        }

        //if team is same length use it.
        if (prevTeam.length == size){
          team = prevTeam;
        }

      } 
      else { 
        team.push(this.playerNum);
        for ( var i=0; i < size - 1; i++) {
          if (i != this.playerNum) {
            team.push(i);
          }
          else {
            team.push((i+1)%players.length);
            i++;
          }
        }
      }
      
 

    return team;
  };
  // retrun true or false to approve or disapprove
  this.voteForTeam = function(missNum, team) {
    return true;
  };
  // return true to play Success card, false to Fail 
  this.missionPlaySuccess = function(missNum, team) {
    if (isGood) {
      return true; // required
    } else {
      // TODO: add strategy
      return false;
    }
  };
}

var players = [];
for (var i = 0; i < good; i++) {
  players.push(new Player(true));
}
for (var i = 0; i < spy; i++) {
  players.push(new Player(false));
}

function spliceRandomElementFromArray(arr) {
  // chooses a random element of arr, removes it, returns it
  var ranNumber = Math.floor(Math.random()*(arr.length));
  return arr.splice(ranNumber,1)[0];    

}
function shuffle(arr) {
  // returns another array containing the elements of arr in random order
  var out = [];
  while (arr.length > 0) {
    out.push(spliceRandomElementFromArray(arr));
  }
  return out;
}

// Return true if good guys win
function playGame(playerArr) {
  var history = new History();
  var numMissions = missionSizes.length;
  var missionSuccesses = 0;
  var missionFailures = 0;
  var leader = 0;
  for (var missNum = 0; missNum < numMissions; missNum++) {
    var voteFailures = 0;
    // 1. leader chooses team
    var myTeam = playerArr[leader].leaderChooseTeam(history);
    if (myTeam.length !== missionSizes[missNum]) {
      throw new Error("Bad team length "+ JSON.stringify(myTeam));
    }
    for (var i=0; i< myTeam.length; i++){
      if (!( (myTeam[i] >= 0) && (myTeam[i] <= 4) )) {
              throw new Error("Team is not real!" +JSON.stringify(myTeam));
      }
    }


    log("Leader " + playerArr[leader] + " chose " + myTeam );
    // 2. all vote on team
    var numYesVotes = 0;
    var numNoVotes = 0;
    for (var voterNum = 0; voterNum < playerArr.length; voterNum++ ) {
      var vote = playerArr[voterNum].voteForTeam(missNum, myTeam);
      if (vote) {
        numYesVotes++;
      } else {
        numNoVotes++;
      }
    }
    // TODO: which way to ties go? for now assume odd num
    if (numYesVotes > numNoVotes) {
      // 3. team does mission
      var failCardsPlayed = 0;
      for (var i=0; i < myTeam.length;i++){
        var player = playerArr[myTeam[i]]; 
        if (!(player.missionPlaySuccess(missNum, myTeam))) {
          log("Player " +player + " failed mission " + missNum);
          ++failCardsPlayed;
        }
      }
      if (failCardsPlayed > 0){
        history.missionSuccesses.push(false);
        history.missionTeams.push(myTeam);
        ++missionFailures;
      } else {
        history.missionSuccesses.push(true);
        if (history.missionSucceeded) {
          if (missionSizes[missNum] > missionSizes[history.largestSuccessTeamIndex])
            history.largestSuccessTeamIndex = missNum;
        }
        else {
          history.largestSuccessTeamIndex = missNum;
        }
        history.missionSucceeded = true;
        history.missionTeams.push(myTeam);
        ++missionSuccesses;
      }            
    } else {
      voteFailures++;
      if (voteFailures == maxVoteFails) {
        return false;
      }
    }
    // Either way, increment leader
    leader = (leader + 1) % (playerArr.length);     
  }
  log("History: " + JSON.stringify(history));
  return {win:(missionSuccesses > missionFailures), history: history};
}
var wins = 0;
var games = 100;

if (DEBUG) {
  games = 1;
}

// Key is the player array, stringified
var totals = {};
var buckets = 0;
var wins = 0;
var keys = [];
var msgs = {};
for (var gNum = 0; gNum < games; gNum++) {
  
  players = shuffle(players);
  for (var j = 0; j < players.length; j++) {
    players[j].playerNum = j;
  }

  var result = playGame(players);
  totals[players] = (totals[players]|0) + 1;
  if (totals[players] == 1) {
    var msg = "";
    msg += players;
    msg += " : ";
    msg += result.win ? "W : " : "L : ";
    msg += result.history.missionSuccesses.map(function(x) {return x?"W":"_";});
    msg += " : ";
    msg += result.history.missionTeams.join(" ");
    buckets++;
    var key = "" + players;
    msgs[key] = msg;
    keys.push(key);
    if (result.win) {
      wins++;
    }
  }
  if (buckets == 10) {
    break;
  }
}
keys.sort();
for (var i = 0; i < keys.length; i++) {
  console.log ("#" + i + ": " + msgs[keys[i]]);
}
console.log("Total wins: " + wins);
// only win if evil is p3 and p4
// 2/5 chance of 1e going in slot 5
// 1/4 chance of 2e going in slot 4
// (2/5)
