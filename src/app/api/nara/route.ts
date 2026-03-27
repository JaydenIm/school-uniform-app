import { NextResponse } from "next/server";

export async function GET() {
  // 실제 나라장터 API 키가 없을 경우를 대비한 고품질 모의 데이터
  // 실제 서비스 시에는 data.go.kr에서 발급받은 인증키를 사용하여 외부 API를 호출하도록 변경 가능합니다.
  const mockBids = [
    {
      id: "20240327-001",
      bidNtceNm: "2024학년도 서울동대문중학교 신입생 교복(동·하복 및 생활복) 학교주관구매 입찰 공고",
      ntceInstNm: "서울특별시교육청 서울동대문중학교",
      bidMethodNm: "제한(단가)최초입찰",
      bidEndDate: "2024-04-12 10:00",
      status: "진행중",
      url: "https://www.g2b.go.kr"
    },
    {
      id: "20240327-002",
      bidNtceNm: "2024학년도 경기수원고등학교 신입생 교복(동복, 하복) 구매 입찰",
      ntceInstNm: "경기도교육청 경기수원고등학교",
      bidMethodNm: "제한(단가)경쟁",
      bidEndDate: "2024-04-05 14:00",
      status: "마감임박",
      url: "https://www.g2b.go.kr"
    },
    {
      id: "20240326-045",
      bidNtceNm: "2024학년도 부산해운대중학교 학생 교복(동·하복) 학교주관구매 입찰",
      ntceInstNm: "부산광역시교육청 부산해운대중학교",
      bidMethodNm: "일반(단가)경쟁",
      bidEndDate: "2024-04-20 10:00",
      status: "진행중",
      url: "https://www.g2b.go.kr"
    },
    {
      id: "20240325-012",
      bidNtceNm: "2024학년도 인천송도고등학교 교복(동·하복) 학교주관구매 입찰 공고(2단계 경쟁)",
      ntceInstNm: "인천광역시교육청 인천송도고등학교",
      bidMethodNm: "제한(단가)경쟁",
      bidEndDate: "2024-04-01 10:00",
      status: "진행중",
      url: "https://www.g2b.go.kr"
    },
    {
      id: "20240324-089",
      bidNtceNm: "2024학년도 대전과학고등학교 교복 구매 입찰 건",
      ntceInstNm: "대전광역시교육청 대전과학고등학교",
      bidMethodNm: "제한(단가)최초입찰",
      bidEndDate: "2024-03-31 16:00",
      status: "마감임박",
      url: "https://www.g2b.go.kr"
    },
    {
      id: "20240320-112",
      bidNtceNm: "2024학년도 광주북중학교 신입생 교복(동·하복) 학교주관구매 입찰 공고",
      ntceInstNm: "광주광역시교육청 광주북중학교",
      bidMethodNm: "제한(단가)경쟁",
      bidEndDate: "2024-04-15 11:00",
      status: "진행중",
      url: "https://www.g2b.go.kr"
    }
  ];

  try {
    // 실제 API 호출 로직 (주석 처리)
    /*
    const serviceKey = process.env.NARA_API_KEY;
    const response = await fetch(`https://apis.data.go.kr/123/bidInfo?serviceKey=${serviceKey}&type=json&bidNm=교복`);
    const data = await response.json();
    return NextResponse.json(data);
    */

    return NextResponse.json({
      success: true,
      data: mockBids,
      totalCount: mockBids.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: "나라장터 데이터를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
