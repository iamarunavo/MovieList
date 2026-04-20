'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export function useFavorites() {
  const { currentUser } = useAuth();
  const [favourites, setFavourites] = useState<any[]>([]);
  const [processingMovies, setProcessingMovies] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!currentUser) {
      setFavourites([]);
      return;
    }
    const load = async () => {
      try {
        const q = query(collection(db, 'favorites'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        setFavourites(snap.docs.map(d => d.data().movie));
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    load();
  }, [currentUser]);

  const addFavorite = useCallback(
    async (movie: any) => {
      if (!currentUser || processingMovies.has(movie.id)) return;
      setProcessingMovies(prev => new Set([...prev, movie.id]));
      try {
        await setDoc(doc(db, 'favorites', `${currentUser.uid}_${movie.id}`), {
          userId: currentUser.uid,
          movie,
          addedAt: new Date().toISOString(),
        });
        setFavourites(prev => [...prev, movie]);
      } catch (err) {
        console.error('Error adding favorite:', err);
      } finally {
        setProcessingMovies(prev => {
          const s = new Set(prev);
          s.delete(movie.id);
          return s;
        });
      }
    },
    [currentUser, processingMovies]
  );

  const removeFavorite = useCallback(
    async (movie: any) => {
      if (!currentUser || processingMovies.has(movie.id)) return;
      setProcessingMovies(prev => new Set([...prev, movie.id]));
      try {
        await deleteDoc(doc(db, 'favorites', `${currentUser.uid}_${movie.id}`));
        setFavourites(prev => prev.filter(f => f.id !== movie.id));
      } catch (err) {
        console.error('Error removing favorite:', err);
      } finally {
        setProcessingMovies(prev => {
          const s = new Set(prev);
          s.delete(movie.id);
          return s;
        });
      }
    },
    [currentUser, processingMovies]
  );

  const isFavourite = useCallback(
    (id: number) => favourites.some(f => f.id === id),
    [favourites]
  );

  return { favourites, processingMovies, addFavorite, removeFavorite, isFavourite };
}
