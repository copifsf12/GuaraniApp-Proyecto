// ==============================================================================
// GUARANIAPP - PRODUCTION SCORING & TELEMETRY ENGINE
// ==============================================================================

export class LessonScoreTracker {
  constructor(totalQuestions) {
    this.totalQuestions = Math.max(0, parseInt(totalQuestions, 10) || 0);
    this.questionAttempts = {}; // { [questionId]: { attempts: 0, isCorrect: false, answeredCorrectlyFirstTry: false } }
    this.startTime = Date.now();
    this.endTime = null;
  }

  recordAttempt(questionId, isCorrect) {
    if (!this.questionAttempts[questionId]) {
      this.questionAttempts[questionId] = {
        attempts: 1,
        isCorrect: !!isCorrect,
        firstTryCorrect: !!isCorrect
      };
    } else {
      const q = this.questionAttempts[questionId];
      q.attempts += 1;
      if (isCorrect) {
        q.isCorrect = true;
      }
    }
  }

  finish() {
    this.endTime = Date.now();
  }

  getMetrics(baseXp = 15, coinReward = 10) {
    const questions = Object.values(this.questionAttempts);
    
    // Fallback: If totalQuestions wasn't provided or differed, use recorded unique question count
    const total = this.totalQuestions > 0 ? this.totalQuestions : questions.length;
    
    let correctCount = 0;
    let incorrectAttempts = 0;

    questions.forEach(q => {
      if (q.firstTryCorrect) {
        correctCount += 1;
      }
      if (q.attempts > 1 || !q.isCorrect) {
        incorrectAttempts += (q.attempts - (q.isCorrect ? 1 : 0));
      }
    });

    // Zero-division protection and standard rounding
    const accuracy = total > 0
      ? Math.min(100, Math.max(0, Math.round((correctCount / total) * 100)))
      : 0;

    // Elapsed time calculation
    const durationMs = (this.endTime || Date.now()) - this.startTime;
    const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Duolingo-style XP scaling based on accuracy
    const accuracyBonus = accuracy >= 90 ? 5 : accuracy >= 70 ? 3 : 0;
    const finalXp = baseXp + accuracyBonus;

    return {
      totalQuestions: total,
      correctCount,
      incorrectCount: incorrectAttempts,
      accuracy,
      totalSeconds,
      formattedTime,
      xpEarned: finalXp,
      coinsEarned: coinReward
    };
  }
}
