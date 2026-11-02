# יומן גבייה לקליניקה

דשבורד גבייה למטפלת רגשית: רישום פגישות, סימון תשלומים (אשראי / מזומן / העברה בנקאית), חובות פתוחים, סיכום חודשי וייצוא לאקסל.

- `index.html` – הדף כולו (HTML + CSS + JS, בלי תלויות).
- הדף מתפרסם כ-Artifact פרטי ב-claude.ai ושומר את הנתונים במסד הנתונים של ה-Artifact (`db`), כך שהם מסתנכרנים בין מכשירים.
- רק בעלת הדף ומי שהוזמנה כעורכת (Editor) יכולות לקרוא ולכתוב נתונים.

## מבנה הנתונים
- `settings/main` – `{clinicName, defaultPrice}`
- `patients/<id>` – `{name, phone, note, active, createdAt}`
- `sessions/<id>` – `{patientId, date, price, status: held|late|free, note, payments: [{amount, method: credit|cash|transfer, date, receipt}]}`

---

# מצפן – מפת הפרויקטים, הכספת והגיבויים

מערכת לניהול הפרויקטים הדיגיטליים: מפת השירותים של כל פרויקט (קוד, אירוח, נתונים, דומיין, חיבורים, גיבוי), תהליך של שבעה שלבים לאבטחה ולגיבוי, וכספת מוצפנת לפרטי הגישה.

- `matzpen/index.html` – הדף כולו (HTML + CSS + JS, בלי תלויות). נבנה מהדמו "Matzpen-Demo" והוסבה למערכת עובדת.
- מתפרסם כ-Artifact פרטי ב-claude.ai עם היכולות `db`, `user` ו-`downloads`.
- כל הנתונים נשמרים תחת `data/users/<מזהה המשתמשת>/` – אזור פרטי שרק המשתמשת עצמה קוראת וכותבת, ומסתנכרן בין המכשירים שלה.

## הצפנת פרטי הגישה
- הערכים (סיסמאות, מפתחות, קודי שחזור) מוצפנים בדפדפן לפני השמירה: PBKDF2-SHA256 (310,000 סבבים) מסיסמת־אב → AES-GCM 256.
- סיסמת־האב לא נשמרת בשום מקום. נשמרים רק ה-salt וטקסט בדיקה מוצפן, כדי לוודא שהסיסמה נכונה.
- בלי סיסמת־האב אי אפשר לשחזר את הערכים. הכספת ננעלת אחרי 10 דקות ללא פעילות ובכל רענון.

## מבנה הנתונים (`data/users/<id>/…`)
- `vault` – `{salt, iter, check: {iv, ct}, createdAt}`
- `p-<id>` – `{name, type, description, services: {code, hosting, database, domain, automation, backup}, done: [taskId], doneAt: {taskId: yyyy-mm-dd}, accounts: {role: text}, extras: [{id, role, name, kind, username, url, purpose, where, secret: {iv, ct} | null, updatedAt}], createdAt}`

## גיבוי
"ייצוא גיבוי" שומר קובץ JSON עם כל הפרויקטים ונתוני הכספת (הערכים נשארים מוצפנים). "ייבוא מגיבוי" מחזיר אותם; פרויקט עם אותו מזהה מוחלף בגרסה שבקובץ.
