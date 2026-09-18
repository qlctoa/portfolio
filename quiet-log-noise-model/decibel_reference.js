/**
 * quiet_log(Expo/React Native) 데시벨(dB) 측정 참고 구현
 * ---------------------------------------------------------
 * 방법 A (권장): expo-av의 내장 미터링을 그대로 사용
 *   - OS(iOS/Android)가 이미 계산해주는 dBFS 값을 그대로 받아서 쓰면 되고,
 *     별도 신호처리 코드가 필요 없습니다. quiet_log의 데모 데이터를 이 값으로
 *     바로 교체할 수 있습니다.
 *
 * 방법 B: 원시 PCM 샘플이 있을 때 직접 dBFS를 계산 (RMS 기반)
 *   - Python 학습 파이프라인(extract_features.py)의 dBFS 계산과 동일한 공식이라,
 *     "서버에서 계산한 값 vs 기기에서 계산한 값"을 비교/검증할 때 사용합니다.
 *
 * 주의: dBFS는 "풀스케일 대비 상대값"이라 기기마다/마이크마다 절대 소음(dB(A) SPL)과는
 * 차이가 있습니다. 실제 데시벨 값처럼 보여주려면 소음계로 몇 개 기준점을 측정해
 * 보정 오프셋(calibrationOffset)을 구해서 더해줘야 합니다.
 */

// ---------- 방법 A: expo-av 내장 미터링 ----------
// import { Audio } from "expo-av";
//
// async function startMetering(onUpdate) {
//   await Audio.requestPermissionsAsync();
//   await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//
//   const { recording } = await Audio.Recording.createAsync(
//     Audio.RecordingOptionsPresets.HIGH_QUALITY,
//     (status) => {
//       if (status.isRecording && status.metering != null) {
//         // status.metering: 대략 -160(무음) ~ 0(풀스케일) dBFS
//         onUpdate(status.metering);
//       }
//     },
//     100 // 업데이트 주기(ms)
//   );
//   return recording;
// }

// ---------- 방법 B: 원시 PCM에서 직접 계산 ----------

/**
 * PCM 샘플 배열(-1~1로 정규화된 Float 배열)로부터 dBFS를 계산합니다.
 * Python extract_features.py의 rms_to_dbfs()와 동일한 공식입니다.
 * @param {Float32Array|number[]} samples
 * @returns {number} dBFS (0에 가까울수록 큰 소리, 보통 음수)
 */
function calcDbfs(samples) {
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    sumSq += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sumSq / samples.length) || 1e-10;
  return 20 * Math.log10(Math.max(rms, 1e-10));
}

/**
 * 최근 N개의 dBFS 측정값을 이동평균으로 부드럽게 만들어
 * 화면에 표시하기 좋은 값으로 변환합니다.
 */
class DbfsSmoother {
  constructor(windowSize = 5) {
    this.windowSize = windowSize;
    this.buffer = [];
  }
  push(value) {
    this.buffer.push(value);
    if (this.buffer.length > this.windowSize) this.buffer.shift();
    return this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
  }
}

/**
 * dBFS -> 화면 표시용 근사 dB(A) 변환.
 * calibrationOffset은 실제 소음계로 몇 지점을 측정해 직접 구해야 하는 값입니다.
 * (예: 조용한 방에서 소음계 35dB일 때 앱의 dBFS가 -60이었다면 offset ≈ 95)
 */
function dbfsToApproxSpl(dbfs, calibrationOffset = 94) {
  return Math.round(dbfs + calibrationOffset);
}

module.exports = { calcDbfs, DbfsSmoother, dbfsToApproxSpl };
