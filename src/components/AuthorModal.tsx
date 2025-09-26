"use client";

import { Author } from "@/types";
import { X } from "lucide-react";

interface AuthorModalProps {
  author: Author | null;
  onClose: () => void;
}

export default function AuthorModal({ author, onClose }: AuthorModalProps) {
  if (!author) return null;

  return (
    <div className='fixed inset-0 shadow-lg backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-start justify-between mb-6'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
                {author.profileImage ? (
                  <img
                    src={author.profileImage}
                    alt={author.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-lg font-semibold text-gray-600'>
                    {author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div>
                <h3 className='text-xl font-bold text-gray-900'>
                  {author.name}
                </h3>
                <p className='text-sm text-gray-600'>{author.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <X className='h-6 w-6' />
            </button>
          </div>

          {/* Bio */}
          <div className='mb-6'>
            <h4 className='text-sm font-semibold text-gray-900 mb-2'>About</h4>
            <p className='text-sm text-gray-600 leading-relaxed'>
              {author.bio}
            </p>
          </div>

          {/* Quote */}
          {author.quote && (
            <div className='mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500'>
              <p className='text-sm italic text-blue-900'>&quot;{author.quote}&quot;</p>
            </div>
          )}

          {/* Books */}
          {author.books && author.books.length > 0 && (
            <div className='mb-6'>
              <h4 className='text-sm font-semibold text-gray-900 mb-3'>
                Books
              </h4>
              <div className='space-y-2'>
                {author.books.map((book, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {book.title}
                      </div>
                      <div className='text-xs text-gray-600'>{book.year}</div>
                    </div>
                    {book.url && (
                      <a
                        href={book.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-blue-600 hover:text-blue-800'
                      >
                        View Book
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {author.socialLinks && (
            <div className='flex gap-3'>
              {author.socialLinks.linkedin && (
                <a
                  href={author.socialLinks.linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700'
                >
                  LinkedIn
                </a>
              )}
              {author.socialLinks.twitter && (
                <a
                  href={author.socialLinks.twitter}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-3 py-2 bg-blue-400 text-white text-xs font-medium rounded-lg hover:bg-blue-500'
                >
                  Twitter
                </a>
              )}
              {author.socialLinks.website && (
                <a
                  href={author.socialLinks.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700'
                >
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
