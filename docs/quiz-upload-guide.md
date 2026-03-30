# Quiz Upload Guide

## CSV Format

Create a CSV file with the following columns:
```
question_text,option_a,option_b,option_c,option_d,correct_answer,explanation
```

### Example:
```csv
What causes dandruff?,Dry scalp,Oily scalp,Fungal overgrowth,All of the above,All of the above,Dandruff can be caused by multiple factors
How often should you wash oily hair?,Daily,Every other day,Once a week,Twice a week,Every other day,Over-washing can stimulate more oil production
```

## JSON Format

```json
[
  {
    "question_text": "What causes dandruff?",
    "options": ["Dry scalp", "Oily scalp", "Fungal overgrowth", "All of the above"],
    "correct_answer": "All of the above",
    "explanation": "Dandruff can be caused by multiple factors"
  }
]
```

## AI Generation

1. Go to Admin → Quizzes
2. Click "Generate with AI"
3. Enter:
   - **Topic**: e.g., "Scalp health basics"
   - **Difficulty**: easy, medium, or hard
   - **Number of questions**: 5-20
4. Review and edit generated questions before saving

## Scalp Assessment Quiz (User-Facing)

The scalp assessment quiz at `/quiz` is NOT a knowledge quiz — it's a diagnostic assessment:
- **Hair Shedding Level**: less than 50, 50-100, 100-150, 150+
- **Scalp Feel**: dry, balanced, slightly oily, very oily
- **Symptoms**: white flakes, yellow flakes, itch, redness, pimples, burning
- **Hair Changes**: thinning hairline, widening part, reduced ponytail, sudden fall
- **Lifestyle**: stress level, sleep hours, protein intake, styling frequency
- **Photo Upload**: front scalp, top scalp, crown (optional)

The report score is computed using weighted factors (not correct/incorrect answers).
