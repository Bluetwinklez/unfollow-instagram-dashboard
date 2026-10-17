"use strict";
const reason = new URLSearchParams(location.search).get("reason");
const reasons = {
  site: "Bu eklenti www.instagram.com sekmesinde açılır. Instagram’ı açıp eklenti simgesine tekrar tıkla.",
  storage: "Eklentinin yerel kayıtları okunamadı. Chrome’u yeniden başlatmayı veya eklentiyi yeniden yüklemeyi dene.",
  launch: "Panel açılamadı. Instagram sayfasını yenile ve simgeye tekrar tıkla. chrome:// gibi tarayıcı sayfalarında açılamaz."
};
if (reasons[reason]) {
  const notice = document.getElementById("launch-notice");
  notice.textContent = reasons[reason];
  notice.hidden = false;
}
