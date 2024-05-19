import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD8zILnvpC6YaXhKoHNLzZATBUs2Nc-6_A',
  authDomain: 'nomnomnomnomnomnom.firebaseapp.com',
  projectId: 'nomnomnomnomnomnom',
  storageBucket: 'nomnomnomnomnomnom.appspot.com',
  messagingSenderId: '319368335728',
  appId: '1:319368335728:web:60f48f7943a4f458573fb5',
  measurementId: 'G-4LXV92DV53',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getUserData(uid: string) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return null;
}

export async function getUserPreferences(userIds: string[]): Promise<string[]> {
  const userDataPromises = userIds.map(async (userId) => {
    const userData = await getUserData(userId);
    return userData?.favourites || [];
  });

  const userDataArrays = await Promise.all(userDataPromises);
  const allFoods = userDataArrays.flat();

  return allFoods;
}

export function getFoodRecommendations(numUsers: number, foods: string[]): string[] {
  const foodCounts: { [food: string]: number } = {};
  const recommendations: string[] = [];

  const lowBucket: string[] = [];
  const midBucket: string[] = [];
  const highBucket: string[] = [];

  foods.forEach((food) => {
    foodCounts[food] = (foodCounts[food] || 0) + 1;
  });

  for (const [food, count] of Object.entries(foodCounts)) {
    const percentage = (count / numUsers) * 100;

    if (percentage > 75) {
      highBucket.push(food);
    } else if (percentage > 25) {
      midBucket.push(food);
    } else {
      lowBucket.push(food);
    }
  }

  if (highBucket.length >= 2) {
    recommendations.push(...getRandomItems(highBucket, 2));
  } else {
    recommendations.push(...highBucket);
    const remaining = 2 - highBucket.length;
    if (midBucket.length >= remaining) {
      recommendations.push(...getRandomItems(midBucket, remaining));
    } else {
      recommendations.push(...midBucket);
      const remainingLow = remaining - midBucket.length;
      recommendations.push(...getRandomItems(lowBucket, remainingLow));
    }
  }

  if (midBucket.length > 0) {
    recommendations.push(...getRandomItems(midBucket, 1));
  } else if (lowBucket.length > 0) {
    recommendations.push(...getRandomItems(lowBucket, 1));
  }

  return recommendations;
}

function getRandomItems(array: string[], n: number): string[] {
  const result = [];
  const availableIndices = array.map((_, index) => index);

  while (n > 0 && availableIndices.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const [selectedIndex] = availableIndices.splice(randomIndex, 1);
    result.push(array[selectedIndex]);
    n--;
  }

  return result;
}
