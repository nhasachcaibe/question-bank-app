async function saveJson() {
  const result = document.getElementById("result");
  const input = document.getElementById("jsonInput").value.trim();

  if (!input) {
    result.innerHTML = "Bạn chưa dán JSON.";
    return;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    result.innerHTML = "JSON không hợp lệ.";
    return;
  }

  try {
    // 1. Lưu đoạn văn
    const passage = data.passages?.[0];

    if (!passage) {
      result.innerHTML = "JSON chưa có passages.";
      return;
    }

    const passageRes = await fetch(`${SUPABASE_URL}/rest/v1/passages`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        title: passage.title || data.title || "Không tiêu đề",
        content: passage.content || "",
        grade: data.grade || passage.grade || "",
        subject: data.subject || passage.subject || ""
      })
    });

    const passageData = await passageRes.json();

    if (!passageRes.ok) {
      result.innerHTML = "Lỗi lưu passages: " + JSON.stringify(passageData);
      return;
    }

    const passageId = passageData[0].id;

    // 2. Lưu câu hỏi
    const questions = (data.questions || []).map((q, index) => ({
      passage_id: passageId,
      question: q.question || "",
      answer_a: q.options?.find(o => o.key === "A")?.text || q.answer_a || "",
      answer_b: q.options?.find(o => o.key === "B")?.text || q.answer_b || "",
      answer_c: q.options?.find(o => o.key === "C")?.text || q.answer_c || "",
      answer_d: q.options?.find(o => o.key === "D")?.text || q.answer_d || "",
      correct: q.correct || "",
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      subject: data.subject || "",
      grade: data.grade || ""
    }));

    if (questions.length === 0) {
      result.innerHTML = "Đã lưu đoạn văn, nhưng chưa có câu hỏi.";
      return;
    }

    const qRes = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(questions)
    });

    const qData = await qRes.text();

    if (!qRes.ok) {
      result.innerHTML = "Lỗi lưu questions: " + qData;
      return;
    }

    result.innerHTML = `Đã lưu thành công ${questions.length} câu hỏi.`;

  } catch (err) {
    console.error(err);
    result.innerHTML = "Có lỗi khi lưu dữ liệu.";
  }
}
