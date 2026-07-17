export default function Footer() {
  return (
    <footer className="mt-24 border-t border-sandDeep bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row justify-between gap-6 text-sm text-ink/60">
        <div>
          <p className="font-display text-lg text-teal-700 mb-1">Tổ Ấm</p>
          <p>Nền tảng tìm và cho thuê phòng trọ nhanh chóng, minh bạch.</p>
        </div>
        <div>
          <p>© {new Date().getFullYear()} Tổ Ấm. Đồ án môn học — dữ liệu demo.</p>
        </div>
      </div>
    </footer>
  );
}
