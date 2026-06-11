/*
  Pure backend-style jackpot engine.
  Move this file into a real worker, cron job, or serverless function when
  Sports API results become available.
*/

function settleMatch({ predictions, winningTeam, participants = [], roundBudget = 0 }) {
  const submittedUserIds = new Set(predictions.map((prediction) => prediction.userId));
  const forfeitedParticipants = participants.filter((participant) => !submittedUserIds.has(participant.userId));
  const losingPredictions = predictions.filter((prediction) => prediction.team !== winningTeam);
  const winningPredictions = predictions.filter((prediction) => prediction.team === winningTeam);
  const noPickForfeitPool = forfeitedParticipants.reduce((sum, participant) => sum + (participant.roundBudget ?? roundBudget), 0);
  const matchJackpotPool = losingPredictions.reduce((sum, prediction) => sum + prediction.points, 0) + noPickForfeitPool;
  const totalWinnerStake = winningPredictions.reduce((sum, prediction) => sum + prediction.points, 0);

  const predictionSettlements = predictions.map((prediction) => {
    if (prediction.team !== winningTeam) {
      return {
        userId: prediction.userId,
        team: prediction.team,
        originalPoints: prediction.points,
        returnedStake: 0,
        jackpotShare: 0,
        totalAwarded: 0,
        result: "lost"
      };
    }

    const ratio = totalWinnerStake === 0 ? 0 : prediction.points / totalWinnerStake;
    const jackpotShare = Math.round(ratio * matchJackpotPool);

    return {
      userId: prediction.userId,
      team: prediction.team,
      originalPoints: prediction.points,
      returnedStake: prediction.points,
      jackpotShare,
      totalAwarded: prediction.points + jackpotShare,
      result: "won"
    };
  });

  const forfeitSettlements = forfeitedParticipants.map((participant) => ({
    userId: participant.userId,
    team: null,
    originalPoints: participant.roundBudget ?? roundBudget,
    returnedStake: 0,
    jackpotShare: 0,
    totalAwarded: 0,
    result: "forfeited_no_pick"
  }));

  const settlements = [...predictionSettlements, ...forfeitSettlements];

  return {
    winningTeam,
    matchJackpotPool,
    noPickForfeitPool,
    totalWinnerStake,
    settlements,
    leaderboardDelta: settlements.map((settlement) => ({
      userId: settlement.userId,
      pointsDelta: settlement.result === "won" ? settlement.jackpotShare : -settlement.originalPoints
    }))
  };
}

function exampleCronJobPayload() {
  return settleMatch({
    winningTeam: "الهلال",
    roundBudget: 100,
    participants: [
      { userId: "u1" },
      { userId: "u2" },
      { userId: "u3" },
      { userId: "u4" },
      { userId: "u5" }
    ],
    predictions: [
      { userId: "u1", team: "الهلال", points: 120 },
      { userId: "u2", team: "العين", points: 90 },
      { userId: "u3", team: "الهلال", points: 80 },
      { userId: "u4", team: "العين", points: 60 }
    ]
  });
}

if (typeof module !== "undefined") {
  module.exports = { settleMatch, exampleCronJobPayload };
}
