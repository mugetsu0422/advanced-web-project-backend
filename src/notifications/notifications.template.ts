export const studentNotificationTemplates = {
  gradeCompositionFinalized: (gpName: string, className: string) =>
    `<strong>${gpName}</strong>'s grading in <strong>${className}</strong> has been finalized`,

  teacherRepliedToGradeReview: (gpName: string, className: string) =>
    `Your teacher in <strong>${className}</strong> has responded to your ${gpName}'s grade review.`,

  finalDecisionOnMarkReview: (gpName: string, className: string) =>
    `A final decision has been made on your ${gpName}'s mark review in <strong>${className}</strong>.`,
}

export const teacherNotificationTemplates = {
  gradeReviewRequested: (gpName: string, className: string) =>
    `A student has requested a grade review on ${gpName} in <strong>${className}</strong>.`,

  studentRepliedToGradeReview: (gpName: string, className: string) =>
    `A student in <strong>${className}</strong> has responded to your ${gpName}'s grade review.`,
}
