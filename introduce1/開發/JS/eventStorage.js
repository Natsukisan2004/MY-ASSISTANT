// Firestore に新規イベントを保存する関数（_id 自動生成付き）
export async function saveEvent(userUId, event) {
  if (!userUId) {
    throw new Error("ユーザーIDが指定されていません");
  }
  if (!event) {
    throw new Error("保存対象のイベントが指定されていません");
  }

  const db = firebase.firestore();

  // _id を自動生成（存在しない場合のみ）
  if (!event._id) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      event._id = crypto.randomUUID();
    } else {
      // 互換性のためUUID生成がない環境用の簡易代替
      event._id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    }
  }

  const eventRef = db
    .collection("users")
    .doc(userUId)
    .collection("events")
    .doc(event._id);

  try {
    await eventRef.set(JSON.parse(JSON.stringify(event)));
    console.log("✅ 新規イベント保存成功:", event._id);
    return event._id;
  } catch (error) {
    console.error("❌ イベント保存失敗:", error);
    throw error;
  }
}

// Firestore からイベントを読み込む関数
export async function loadEvents(userUId) {
  if (!userUId) {
    throw new Error("ユーザーIDが指定されていません");
  }

  const db = firebase.firestore();

  try {
    const querySnapshot = await db
      .collection("users")
      .doc(userUId)
      .collection("events")
      .get();

    const loadedEvents = [];
    querySnapshot.forEach((doc) => {
      const event = doc.data();
      event._id = doc.id;
      loadedEvents.push(event);
    });
    return loadedEvents;
  } catch (error) {
    console.error("❌ イベント読み込み失敗:", error);
    throw error;
  }
}

// Firestore からイベントを削除する関数
export async function deleteEvent(userUId, eventId) {
  if (!userUId) {
    throw new Error("ユーザーIDが指定されていません");
  }
  if (!eventId) {
    throw new Error("削除対象のイベントIDが指定されていません");
  }

  const db = firebase.firestore();

  try {
    await db
      .collection("users")
      .doc(userUId)
      .collection("events")
      .doc(eventId)
      .delete();

    console.log("🗑 イベント削除成功:", eventId);
  } catch (error) {
    console.error("❌ イベント削除失敗:", error);
    throw error;
  }
}

// Firestore 上のイベントを更新（上書き）する関数
export async function updateEvent(userUId, eventId, updatedEvent) {
  if (!userUId) {
    throw new Error("ユーザーIDが指定されていません");
  }
  if (!eventId) {
    throw new Error("更新対象のイベントIDが指定されていません");
  }
  if (!updatedEvent) {
    throw new Error("更新イベントデータが指定されていません");
  }

  const db = firebase.firestore();

  try {
    await db
      .collection("users")
      .doc(userUId)
      .collection("events")
      .doc(eventId)
      .set(JSON.parse(JSON.stringify(updatedEvent)));

    console.log("✏️ イベント更新成功:", eventId);
  } catch (error) {
    console.error("❌ イベント更新失敗:", error);
    throw error;
  }
}
