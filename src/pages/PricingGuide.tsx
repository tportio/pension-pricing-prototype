import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export function PricingGuide() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 타이틀 */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">📚 요금 정책 가이드</h1>
        <p className="text-gray-600">펜션플러스 요금 시스템의 전체 구조와 적용 규칙을 확인하세요</p>
      </div>

      {/* 요금 적용 규칙 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 요금 적용 규칙</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-success-50 border-l-4 border-success-500 p-6 rounded-r-lg">
            <div className="text-sm text-gray-700 space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="warning" className="text-base font-bold flex-shrink-0">1</Badge>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">수동 설정된 날짜 → 최우선 적용</div>
                  <div className="text-gray-600">
                    특정 날짜에 직접 설정한 요금이 있다면 다른 모든 규칙보다 우선하여 적용됩니다.
                    예: 특별 이벤트, 프로모션 요금 등
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="info" className="text-base font-bold flex-shrink-0">2</Badge>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">시즌 기간 내 날짜 → 해당 시즌 요금 적용</div>
                  <div className="text-gray-600">
                    정의된 시즌(성수기, 준성수기, 비수기 등) 기간 내의 날짜는 해당 시즌 요금이 적용됩니다.
                    시즌 기간은 겹치지 않도록 설정됩니다.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="default" className="text-base font-bold flex-shrink-0">3</Badge>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">그 외 모든 날짜 → 기본 요금 적용</div>
                  <div className="text-gray-600">
                    수동 설정도 없고 시즌에도 포함되지 않는 날짜는 기본 요금이 적용됩니다.
                    기본 요금은 평상시 운영 요금입니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 요금 구성 요소 */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 요금 구성 요소</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 채널별 요금 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">💰</span>
                채널별 요금
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="font-semibold text-blue-900 mb-2">🏠 예약창 요금</div>
                  <div className="text-sm text-gray-700">
                    펜션 자체 예약창에서 사용하는 요금입니다. 일반적으로 온라인 채널보다 높게 책정합니다.
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="font-semibold text-green-900 mb-2">🌐 온라인채널 요금</div>
                  <div className="text-sm text-gray-700">
                    온라인 예약 플랫폼(OTA)에서 사용하는 요금입니다. 수수료를 고려하여 예약창보다 낮게 책정합니다.
                  </div>
                </div>
              </div>
            </div>

            {/* 요일별 요금 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📅</span>
                요일별 요금
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">월~목 (평일)</div>
                  <div className="text-sm text-gray-600">주중 낮은 수요를 반영한 기본 요금</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">금요일</div>
                  <div className="text-sm text-gray-600">주말 전날로 평일보다 높은 요금</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">토요일</div>
                  <div className="text-sm text-gray-600">주말 최고 수요를 반영한 높은 요금</div>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">일요일</div>
                  <div className="text-sm text-gray-600">체크아웃일로 토요일보다 낮은 요금</div>
                </div>
              </div>
            </div>

            {/* 추가 요금 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">👥</span>
                추가 인원 요금
              </h3>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">성인</Badge>
                    <span>기준 인원 초과 시 추가 요금</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">아동</Badge>
                    <span>성인보다 낮은 추가 요금 (일반적으로 70~80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">유아</Badge>
                    <span>가장 낮은 추가 요금 또는 무료</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시즌 관리 */}
      <Card>
        <CardHeader>
          <CardTitle>🌸 시즌 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              시즌은 특정 기간에 다른 요금을 적용하기 위한 기능입니다.
              성수기, 준성수기, 비수기 등 필요에 따라 자유롭게 설정할 수 있습니다.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="font-semibold text-amber-900 mb-2">⚠️ 주의사항</div>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>시즌 기간은 서로 겹치지 않아야 합니다</li>
                <li>여러 시즌이 동일한 날짜를 포함할 수 없습니다</li>
                <li>시즌에 포함되지 않는 날짜는 자동으로 기본 요금이 적용됩니다</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="font-semibold text-blue-900 mb-2">💡 시즌 예시</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>여름 성수기</strong>: 7월~8월 (해수욕 시즌)</li>
                <li>• <strong>겨울 성수기</strong>: 12월~2월 (스키 시즌)</li>
                <li>• <strong>봄 준성수기</strong>: 4월~5월 (벚꽃, 황금연휴)</li>
                <li>• <strong>가을 준성수기</strong>: 9월~10월 (단풍, 연휴)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수동 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>✏️ 수동 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              특정 날짜에 대해 시즌이나 기본 요금과 다른 요금을 적용하고 싶을 때 사용합니다.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="font-semibold text-yellow-900 mb-2">📌 사용 사례</div>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>특별 이벤트나 페스티벌 기간의 프리미엄 요금</li>
                <li>예약이 적은 날의 할인 프로모션 요금</li>
                <li>단체 예약이나 장기 투숙 할인</li>
                <li>긴급 상황이나 보수 작업으로 인한 임시 요금 조정</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="font-semibold text-green-900 mb-2">✅ 장점</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 시즌을 새로 만들지 않고 빠르게 특정 날짜 요금 변경</li>
                <li>• 다른 설정과 관계없이 항상 최우선 적용</li>
                <li>• 언제든지 쉽게 원복 가능</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시작 안내 */}
      <Card className="bg-gradient-to-br from-primary-50 to-success-50 border-2 border-primary-200">
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">요금 설정을 시작해보세요</h3>
          <p className="text-gray-700 mb-4">
            기본 요금 설정 메뉴에서 시즌과 객실별 요금을 설정하고,<br />
            요금 전체보기에서 실시간으로 확인할 수 있습니다.
          </p>
          <div className="flex justify-center gap-3">
            <Badge variant="info" className="text-sm">기본 요금 설정</Badge>
            <Badge variant="success" className="text-sm">요금 전체보기</Badge>
            <Badge variant="warning" className="text-sm">빠른 설정</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
