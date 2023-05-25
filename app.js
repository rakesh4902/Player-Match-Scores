//start server

const express = require("express");
const path = require("path");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

app.use(express.json());
//set up a connection between db and server
let db = null;
const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db error ${e.message}`);
    process.exit(1);
  }
};

initializeDbandServer();

//converting db object to response object
const convertSnakeToCamelPlayer = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertSnakeToCamelMatch = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

// API-1 (GET PLAYERS)
app.get("/players", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM 
    player_details;`;
  const players = await db.all(getPlayersQuery);
  response.send(
    players.map((eachPlayer) => convertSnakeToCamelPlayer(eachPlayer))
  );
});

//API-2(GET SPECIFIC PLAYER)
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getSpecificPlayerQuery = `
    SELECT * 
    FROM player_details
    WHERE player_id=${playerId};`;
  const spPlayer = await db.get(getSpecificPlayerQuery);
  response.send(convertSnakeToCamelPlayer(spPlayer));
});

//API-3(UPDATE SPECIFIC PLAYER)
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name ='${playerName}'
  WHERE
    player_id = ${playerId};`;

  dbPlayer = await db.run(updatePlayerQuery);
  console.log(dbPlayer);
  response.send("Player Details Updated");
});

//API-4
app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const getSpecificPlayerQuery = `
    SELECT * 
    FROM match_details
    WHERE match_id=${matchId};`;
  const spPlayer = await db.get(getSpecificPlayerQuery);
  response.send(convertSnakeToCamelMatch(spPlayer));
});

//API-5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatches = `
    SELECT * 
    FROM  player_match_score
    NATURAL JOIN match_details
    WHERE player_id=${playerId};`;
  const mP = await db.all(getMatches);
  console.log(mP);
  response.send(mP.map((eachMatch) => convertSnakeToCamelMatch(eachMatch)));
});

//API-6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    SELECT * 
    FROM player_match_score 
    NATURAL JOIN player_details
    WHERE match_id=${matchId};`;
  const mQ = await db.all(matchQuery);
  console.log(mQ);
  response.send(mQ.map((eachPlayer) => convertSnakeToCamelPlayer(eachPlayer)));
});

//API-7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const pQ = await db.get(getMatchPlayersQuery);
  response.send(pQ);
});

module.exports = app;
