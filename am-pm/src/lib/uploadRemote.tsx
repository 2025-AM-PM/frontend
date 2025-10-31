/**
 * Presigned URL을 사용해 파일을 스토리지에 업로드합니다.
 * 성공 시 true, 실패 시 false를 반환합니다.
 * @param presignedUrl - 파일 업로드를 위한 Presigned URL
 * @param file - 업로드할 File 객체
 * @returns {Promise<boolean>} 업로드 성공 여부
 */
export async function uploadImageRemote(
  presignedUrl: string,
  file: File
): Promise<boolean> {
  console.log(`'${file.name}' 파일 업로드를 시작합니다...`);

  console.log("서버로부터 받은 Presigned URL:", presignedUrl);

  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      // ❗ [수정 1] FormData 대신 파일 객체를 body에 직접 전달합니다.
      body: file,
      // ❗ [수정 2] 파일의 실제 MIME 타입을 Content-Type 헤더로 설정합니다.
      headers: {
        "Content-Type": file.type,
      },
    });

    if (response.ok) {
      // 성공 시 응답 본문은 비어있는 경우가 많으므로 굳이 읽지 않아도 됩니다.
      console.log(`✅ '${file.name}' 파일 업로드 성공`);
      return true;
    } else {
      // 실패 시 응답 본문을 포함한 에러를 발생시킵니다.
      const errorText = await response.text();
      throw new Error(`업로드 실패: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    // ❗ [수정 3] 'unknown' 타입의 에러를 안전하게 처리합니다.
    if (error instanceof Error) {
      console.error(`❌ 파일 업로드 중 오류 발생: ${error.message}`);
    } else {
      console.error("❌ 알 수 없는 오류 발생:", error);
    }
    return false;
  }
}
