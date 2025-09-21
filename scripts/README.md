# Bulk Import Scripts

This directory contains scripts to bulk import topics, authors, and questions into the database without using the admin dashboard.

## Quick Start

### Option 1: Simple CLI Tool (Recommended)

```bash
# Import from a JSON file
node scripts/import-data.js your-data.json

# Or run with sample data to test
node scripts/import-data.js
```

### Option 2: Advanced Script

```bash
# Copy the template and edit it
cp scripts/data-template.json scripts/data.json

# Edit scripts/data.json with your data
# Then run:
node scripts/bulk-import.js
```

### Option 3: Direct API Call

```bash
curl -X POST http://localhost:3000/api/admin/bulk-import \
  -H "Content-Type: application/json" \
  -d @your-data.json
```

## Data Format

Your JSON file should follow this structure:

```json
{
  "authors": [
    {
      "slug": "author-slug",
      "name": "Author Name",
      "title": "Author Title",
      "bio": "Author bio...",
      "profileImage": "https://example.com/image.jpg",
      "socialLinks": {
        "linkedin": "https://linkedin.com/in/author",
        "twitter": "https://twitter.com/author"
      },
      "quote": "Author's favorite quote"
    }
  ],
  "topics": [
    {
      "slug": "topic-slug",
      "title": "Topic Title",
      "description": "Topic description...",
      "isNewTopic": true
    }
  ],
  "exams": [
    {
      "slug": "exam-slug",
      "topic": "topic-slug",
      "author": "author-slug",
      "title": "Exam Title",
      "description": "Exam description...",
      "totalPoints": 100,
      "reviewMode": "post",
      "isNew": true,
      "retakeSettings": {
        "enabled": true,
        "maxAttempts": 3,
        "coolDownDays": 1
      },
      "questions": [
        {
          "id": 1,
          "prompt": "What is the question?",
          "options": {
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D"
          },
          "correctKey": "B",
          "explanation": "Why B is correct..."
        }
      ]
    }
  ]
}
```

## Field Descriptions

### Authors
- `slug`: Unique identifier (URL-friendly)
- `name`: Display name
- `title`: Professional title
- `bio`: Biography (optional)
- `profileImage`: Profile image URL (optional)
- `socialLinks`: Social media links (optional)
- `quote`: Favorite quote (optional)

### Topics
- `slug`: Unique identifier (URL-friendly)
- `title`: Display title
- `description`: Topic description (optional)
- `isNewTopic`: Mark as new topic (optional)

### Exams
- `slug`: Unique identifier (URL-friendly)
- `topic`: Reference to topic slug
- `author`: Reference to author slug
- `title`: Exam title
- `description`: Exam description (optional)
- `totalPoints`: Total points for the exam
- `reviewMode`: "immediate" or "post"
- `isNew`: Mark as new exam (optional)
- `retakeSettings`: Retake configuration (optional)
- `questions`: Array of questions

### Questions
- `id`: Unique question ID (number)
- `prompt`: Question text
- `options`: Object with A, B, C, D options
- `correctKey`: Correct answer key ("A", "B", "C", or "D")
- `explanation`: Explanation for the answer (optional)

## Environment Variables

- `API_BASE_URL`: Base URL for API calls (default: http://localhost:3000)

## Examples

### Basic Example
```json
{
  "authors": [
    {
      "slug": "john-smith",
      "name": "John Smith",
      "title": "Investment Advisor"
    }
  ],
  "topics": [
    {
      "slug": "stocks",
      "title": "Stock Market",
      "description": "Learn about stock market basics"
    }
  ],
  "exams": [
    {
      "slug": "stock-basics",
      "topic": "stocks",
      "author": "john-smith",
      "title": "Stock Market Basics",
      "totalPoints": 50,
      "reviewMode": "post",
      "questions": [
        {
          "id": 1,
          "prompt": "What is a stock?",
          "options": {
            "A": "A type of bond",
            "B": "Ownership in a company",
            "C": "A savings account",
            "D": "A type of insurance"
          },
          "correctKey": "B",
          "explanation": "A stock represents ownership in a company."
        }
      ]
    }
  ]
}
```

## Troubleshooting

1. **API Connection Issues**: Make sure your Next.js server is running
2. **Validation Errors**: Check that all required fields are present
3. **Reference Errors**: Ensure topic and author slugs exist before importing exams
4. **Duplicate Slugs**: The system will update existing records with the same slug

## Tips

- Import authors first, then topics, then exams
- Use descriptive slugs that are URL-friendly
- Test with small datasets first
- Keep question IDs unique within each exam
- Use the sample data to test the import process
