import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "iLovePDF - PDF 온라인 도구";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #F7FAFC 0%, #E2E8F0 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.1,
            display: "flex",
            flexWrap: "wrap",
            gap: "40px",
            padding: "40px",
          }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                background: "#E93C3C",
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              background: "#E93C3C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "40px",
              boxShadow: "0 20px 60px rgba(233, 60, 60, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: "72px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              PDF
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#1A202C",
              margin: "0",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            iLovePDF
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "32px",
              color: "#4A5568",
              margin: "0",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.4,
            }}
          >
            PDF를 즐겨 쓰시는 분들을 위한 온라인 PDF 툴
          </p>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "40px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["병합", "분할", "압축", "변환"].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 24px",
                  background: "white",
                  borderRadius: "8px",
                  fontSize: "24px",
                  color: "#4A5568",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
