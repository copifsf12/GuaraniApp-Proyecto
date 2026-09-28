// ==============================================================================
// GUARANIAPP - PRODUCTION SCORING & TELEMETRY ENGINE (v2)
// Ahora cada ejercicio cuenta como 1 (correcto si fue a la primera)
// ==============================================================================

export class LessonScoreTracker {
  constructor(totalQuestions) {
    this.totalQuestions = Math.max(0, parseInt(totalQuestions, 10) || 0);
    // { [questionId]: { attempts, isCorrect, firstTryCorrect } }
    this.questionAttempts = {};
    this.startTime = Date.now();
    this.endTime = null;
  }

  recordAttempt(questionId, isCorrect) {
    if (!this.questionAttempts[questionId]) {
      // Primera vez que se responde este ejercicio
      this.questionAttempts[questionId] = {
        attempts: 1,
        isCorrect: !!isCorrect,
        firstTryCorrect: !!isCorrect
      };
    } else {
      // Intentos adicionales
      const q = this.questionAttempts[questionId];
      q.attempts += 1;
      if (isCorrect) {
        q.isCorrect = true;
      }
      // 🎯 Si falla en cualquier intento, ya NO es "first try correct"
      if (!isCorrect) {
        q.firstTryCorrect = false;
      }
    }
  }

  finish() {
    this.endTime = Date.now();
  }

  getMetrics(baseXp = 15, coinReward = 10) {
    const questions = Object.values(this.questionAttempts);

    // 🎯 Total = cantidad de ejercicios únicos
    const total = this.totalQuestions > 0 ? this.totalQuestions : questions.length;

    // 🎯 Contamos:
    // - Un ejercicio es CORRECTO si lo acertaste A LA PRIMERA
    // - Un ejercicio es INCORRECTO si fallaste en algún intento
    let correctCount = 0;
    let incorrectCount = 0;

    questions.forEach(q => {
      if (q.firstTryCorrect && q.isCorrect) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    });

    // 🎯 Ajuste: si no se registraron todos los ejercicios (porque el usuario se salió antes),
    // los que faltan cuentan como incorrectos para que el total sea correcto
    const answeredTotal = correctCount + incorrectCount;
    if (answeredTotal < total) {
      incorrectCount += (total - answeredTotal);
    }

    // Accuracy = correctas / total (nunca > 100%)
    const accuracy = total > 0
      ? Math.min(100, Math.max(0, Math.round((correctCount / total) * 100)))
      : 0;

    // Tiempo transcurrido
    const durationMs = (this.endTime || Date.now()) - this.startTime;
    const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // XP con bonus por accuracy
    const accuracyBonus = accuracy >= 90 ? 5 : accuracy >= 70 ? 3 : 0;
    const finalXp = baseXp + accuracyBonus;

    return {
      totalQuestions: total,
      correctCount,
      incorrectCount,
      accuracy,
      totalSeconds,
      formattedTime,
      xpEarned: finalXp,
      coinsEarned: coinReward
    };
  }
}