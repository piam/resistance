var good = 3;
var spy = 2;
var missionSizes = [2,3,2,3,3];
var maxVoteFails = 5;

function Player(isGood) {
  this.toString = function(){
    return "P" + this.playerNum + ":" + 
      (isGood ? "g" : "e");
  };
  // return an array of player indices, of
  // apprporiate size
  this.leaderChooseTeam = function(missNum) {
    var size = missionSizes[missNum];
    var team = [];
    // always choose the first n folks
    for (var i = 0; i < size; i++) {
      team.push(i);
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
  var numMissions = missionSizes.length;
  var missionSuccesses = 0;
  var missionFailures = 0;
  var leader = 0;
  for (var missNum = 0; missNum < numMissions; missNum++) {
    var voteFailures = 0;
    // 1. leader chooses team
    var myTeam = playerArr[leader].leaderChooseTeam(missNum);
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
//          console.log("Player " +player + " failed mission " + missNum);
          ++failCardsPlayed;
        }
      }
      if (failCardsPlayed > 0){
        ++missionFailures;
      } else {
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
  return (missionSuccesses > missionFailures);
}
var wins = 0;
var games = 100000;
for (var gNum = 0; gNum < games; gNum++) {
  
  players = shuffle(players);
  for (var j = 0; j < players.length; j++) {
    players[j].playerNum = j;
  }
  var win = playGame(players);
  //console.log("players: " + players + " win? " + win);

  if (win) wins++;
}
console.log("good guys win rate " + (wins / games));
// only win if evil is p3 and p4
// 2/5 chance of 1e going in slot 5
// 1/4 chance of 2e going in slot 4
// (2/5)
