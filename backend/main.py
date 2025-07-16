from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
import json
from typing import List, Dict, Any
import re
import PyPDF2
from docx import Document
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI(title="Resume Parser API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy model (using small English model)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model not found. Please install with: python -m spacy download en_core_web_sm")
    nlp = None

class ResumeParser:
    def __init__(self):
        self.skills_keywords = {
            'programming': ['python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
            'data': ['pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'tableau', 'power bi', 'spark'],
            'mobile': ['ios', 'android', 'react native', 'flutter', 'xamarin', 'swift', 'kotlin'],
            'tools': ['git', 'jira', 'confluence', 'slack', 'trello', 'figma', 'photoshop', 'illustrator']
        }
        
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using keyword matching"""
        text_lower = text.lower()
        found_skills = []
        
        for category, skills in self.skills_keywords.items():
            for skill in skills:
                if skill in text_lower:
                    found_skills.append(skill.title())
        
        return list(set(found_skills))
    
    def extract_experience(self, text: str) -> List[str]:
        """Extract experience information using regex patterns"""
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
            r'(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)',
            r'(?:experience|exp).*?(\d+)\+?\s*years?',
            r'(?:worked|work).*?(\d+)\+?\s*years?',
            r'(?:led|lead|manage|managed).*?team',
            r'(?:senior|sr\.?|lead|principal|architect)',
        ]
        
        experiences = []
        text_lower = text.lower()
        
        for pattern in experience_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                if isinstance(matches[0], str) and matches[0].isdigit():
                    experiences.append(f"{matches[0]} years experience")
                elif 'team' in pattern:
                    experiences.append("Team leadership experience")
                elif any(title in pattern for title in ['senior', 'lead', 'principal']):
                    experiences.append("Senior level experience")
        
        return list(set(experiences))
    
    def extract_education(self, text: str) -> List[str]:
        """Extract education information"""
        education_patterns = [
            r'(?:bachelor|b\.?s\.?|ba|bs)\s*(?:of|in)?\s*([a-zA-Z\s]+)',
            r'(?:master|m\.?s\.?|ma|ms)\s*(?:of|in)?\s*([a-zA-Z\s]+)',
            r'(?:phd|ph\.?d\.?|doctorate)\s*(?:of|in)?\s*([a-zA-Z\s]+)',
            r'(?:certificate|certification|certified)\s*(?:in)?\s*([a-zA-Z\s]+)',
        ]
        
        education = []
        text_lower = text.lower()
        
        for pattern in education_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                if isinstance(match, str) and len(match.strip()) > 2:
                    education.append(match.strip().title())
        
        return list(set(education))
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords using spaCy NLP"""
        if not nlp:
            # Fallback to simple keyword extraction
            words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
            return list(set(words))
        
        doc = nlp(text)
        keywords = []
        
        for token in doc:
            if (token.pos_ in ['NOUN', 'ADJ'] and 
                not token.is_stop and 
                not token.is_punct and 
                len(token.text) > 2):
                keywords.append(token.lemma_.lower())
        
        return list(set(keywords))
    
    def parse_document(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Parse document and extract structured information"""
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self.extract_text_from_pdf(file_content)
        elif filename.lower().endswith(('.docx', '.doc')):
            text = self.extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Extract structured information
        return {
            'fileName': filename,
            'text': text,
            'skills': self.extract_skills(text),
            'experience': self.extract_experience(text),
            'education': self.extract_education(text),
            'keywords': self.extract_keywords(text)
        }

class JobMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    
    def calculate_similarity(self, resume_text: str, job_text: str) -> float:
        """Calculate text similarity using TF-IDF and cosine similarity"""
        try:
            texts = [resume_text, job_text]
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity * 100)
        except:
            return 0.0
    
    def calculate_match(self, resume_data: Dict, job_data: Dict) -> Dict[str, Any]:
        """Calculate comprehensive match score between resume and job"""
        resume_skills = [skill.lower() for skill in resume_data['skills']]
        job_skills = [skill.lower() for skill in job_data['skills']]
        
        # Calculate skill match
        matched_skills = list(set(resume_skills) & set(job_skills))
        missing_skills = list(set(job_skills) - set(resume_skills))
        
        skill_score = (len(matched_skills) / len(job_skills) * 100) if job_skills else 0
        
        # Calculate keyword match
        resume_keywords = set(resume_data['keywords'])
        job_keywords = set(job_data['keywords'])
        keyword_matches = len(resume_keywords & job_keywords)
        keyword_score = (keyword_matches / len(job_keywords) * 100) if job_keywords else 0
        
        # Calculate text similarity
        text_similarity = self.calculate_similarity(resume_data['text'], job_data['text'])
        
        # Calculate experience match (simplified)
        experience_score = 70  # Default score, can be enhanced with more sophisticated matching
        
        # Overall weighted score
        overall_score = (
            skill_score * 0.4 +
            keyword_score * 0.3 +
            text_similarity * 0.2 +
            experience_score * 0.1
        )
        
        # Generate recommendations
        recommendations = self.generate_recommendations(matched_skills, missing_skills, overall_score)
        
        return {
            'score': round(overall_score),
            'matchedSkills': [skill.title() for skill in matched_skills],
            'missingSkills': [skill.title() for skill in missing_skills],
            'keywordDensity': round(keyword_score),
            'textSimilarity': round(text_similarity),
            'recommendations': recommendations
        }
    
    def generate_recommendations(self, matched_skills: List[str], missing_skills: List[str], score: float) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if score < 60:
            recommendations.append("Consider restructuring your resume to better highlight relevant experience")
            recommendations.append("Add more specific technical skills mentioned in the job description")
        
        if missing_skills:
            top_missing = missing_skills[:3]
            recommendations.append(f"Focus on developing these key skills: {', '.join(top_missing)}")
        
        recommendations.extend([
            "Use action verbs and quantify your achievements with specific metrics",
            "Tailor your professional summary to match the job requirements",
            "Include relevant certifications and continuous learning initiatives",
            "Optimize keyword density by naturally incorporating job-specific terms"
        ])
        
        return recommendations

# Initialize parsers
resume_parser = ResumeParser()
job_matcher = JobMatcher()

@app.get("/")
async def root():
    return {"message": "Resume Parser API is running"}

@app.post("/parse")
async def parse_file(file: UploadFile = File(...)):
    """Parse uploaded resume or job description file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.doc']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    try:
        # Read file content
        content = await file.read()
        
        # Parse document
        parsed_data = resume_parser.parse_document(content, file.filename)
        
        return JSONResponse(content=parsed_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/match")
async def calculate_match(resume_data: dict, job_data: dict):
    """Calculate match score between resume and job description"""
    try:
        match_result = job_matcher.calculate_match(resume_data, job_data)
        return JSONResponse(content=match_result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating match: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "spacy_loaded": nlp is not None,
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)