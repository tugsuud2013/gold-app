GoldApp Mobile App эхлүүлнэ.

Одоогийн backend/admin бэлэн:
- Backend API: http://localhost:3000/api
- Admin: http://localhost:3006
- PostgreSQL Docker ажиллаж байгаа
- Auth, User, Wallet, Purchase, Sell Request, Gold Price, News, Chat API байгаа

Mobile app дээр эхний sprint хийх:

1. App structure шалга
2. API base URL тохируул:
   http://localhost:3000/api
   Android emulator бол:
   http://10.0.2.2:3000/api
3. Auth flow:
   - Login
   - Register
   - OTP verify mock/real
   - Token storage
4. Main tabs:
   - Нүүр
   - Wallet
   - Худалдаа
   - Мэдээ
   - Профайл
5. Dashboard screen:
   - Алтны үлдэгдэл
   - Мөнгөн дүн
   - Одоогийн алтны ханш
   - Худалдах / Зарах button
   - Сүүлийн гүйлгээ
6. Design:
   - GoldApp black + gold theme
   - Admin/Home branding-тэй ижил
7. Existing backend эвдэхгүй.
