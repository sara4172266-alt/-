# יומן גבייה לקליניקה

דשבורד גבייה למטפלת רגשית: רישום פגישות, סימון תשלומים (אשראי / מזומן / העברה בנקאית), חובות פתוחים, סיכום חודשי וייצוא לאקסל.

- `index.html` – הדף כולו (HTML + CSS + JS, בלי תלויות).
- הדף מתפרסם כ-Artifact פרטי ב-claude.ai ושומר את הנתונים במסד הנתונים של ה-Artifact (`db`), כך שהם מסתנכרנים בין מכשירים.
- רק בעלת הדף ומי שהוזמנה כעורכת (Editor) יכולות לקרוא ולכתוב נתונים.

## מבנה הנתונים
- `settings/main` – `{clinicName, defaultPrice}`
- `patients/<id>` – `{name, phone, note, active, createdAt}`
- `sessions/<id>` – `{patientId, date, price, status: held|late|free, note, payments: [{amount, method: credit|cash|transfer, date, receipt}]}`
