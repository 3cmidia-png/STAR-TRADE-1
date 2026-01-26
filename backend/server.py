from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'star-trade-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI(title="Star Trade API")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "editor"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBase

# Site Settings
class TranslatableText(BaseModel):
    pt: str = ""
    en: str = ""
    es: str = ""
    
    @classmethod
    def from_value(cls, value):
        """Convert string or dict to TranslatableText"""
        if isinstance(value, str):
            return cls(pt=value, en=value, es=value)
        if isinstance(value, dict):
            return cls(
                pt=value.get("pt", ""),
                en=value.get("en", ""),
                es=value.get("es", "")
            )
        if isinstance(value, TranslatableText):
            return value
        return cls()

class HeroSettings(BaseModel):
    title: TranslatableText = Field(default_factory=lambda: TranslatableText(
        pt="Conectando o Mundo através do Comércio Internacional",
        en="Connecting the World Through International Trade",
        es="Conectando el Mundo a través del Comercio Internacional"
    ))
    subtitle: TranslatableText = Field(default_factory=lambda: TranslatableText(
        pt="Soluções completas em importação e exportação",
        en="Complete import and export solutions",
        es="Soluciones completas en importación y exportación"
    ))
    cta_text: TranslatableText = Field(default_factory=lambda: TranslatableText(
        pt="Fale com um Especialista",
        en="Talk to a Specialist",
        es="Hable con un Especialista"
    ))
    video_url: str = "https://videos.pexels.com/video-files/3226072/3226072-hd_1920_1080_24fps.mp4"
    # Positioning
    vertical_align: str = "center"
    vertical_offset: int = 0
    horizontal_align: str = "center"
    # Title styling
    title_size: int = 48
    title_weight: str = "bold"
    title_uppercase: bool = True
    title_max_width: int = 800
    # Subtitle styling
    subtitle_size: int = 20
    subtitle_weight: str = "normal"
    subtitle_max_width: int = 700
    # CTA Button
    cta_size: str = "large"
    cta_style: str = "filled"
    # Video/Overlay
    overlay_opacity: int = 60
    overlay_color: str = "#000000"
    video_zoom: int = 100
    # Animation
    animation_enabled: bool = True
    animation_type: str = "fade-up"

class AboutSettings(BaseModel):
    title: TranslatableText = Field(default_factory=lambda: TranslatableText(
        pt="Sobre a Star Trade",
        en="About Star Trade",
        es="Acerca de Star Trade"
    ))
    paragraph1: TranslatableText = Field(default_factory=lambda: TranslatableText(
        pt="A Star Trade é uma trading company especializada em soluções completas de importação e exportação. Nossa missão é conectar empresas ao mercado global com eficiência, segurança e inteligência comercial.",
        en="Star Trade is a trading company specialized in complete import and export solutions. Our mission is to connect companies to the global market with efficiency, security and commercial intelligence.",
        es="Star Trade es una empresa comercializadora especializada en soluciones completas de importación y exportación. Nuestra misión es conectar empresas al mercado global con eficiencia, seguridad e inteligencia comercial."
    ))
    paragraph2: TranslatableText = Field(default_factory=lambda: TranslatableText(
        pt="Com anos de experiência no mercado, oferecemos assessoria completa: desde a cotação até a entrega final, incluindo despacho aduaneiro, planejamento logístico e consultoria tributária.",
        en="With years of market experience, we offer complete advisory: from quotation to final delivery, including customs clearance, logistics planning and tax consulting.",
        es="Con años de experiencia en el mercado, ofrecemos asesoría completa: desde la cotización hasta la entrega final, incluyendo despacho aduanero, planificación logística y consultoría tributaria."
    ))
    image_url: str = "https://images.unsplash.com/photo-1703194531119-e8b98a555cb6?q=85&w=1000&auto=format&fit=crop"

class LogoSettings(BaseModel):
    # Desktop
    desktop_width: int = 180  # 50-400px
    desktop_height: int = 0  # 0 = auto
    # Tablet
    tablet_width: int = 150
    # Mobile
    mobile_width: int = 120
    # Position
    position: str = "left"  # left, center, right
    margin_left: int = 24
    margin_right: int = 24
    # Scroll behavior
    shrink_on_scroll: bool = True
    scroll_width: int = 120
    # Effects
    brightness: int = 100  # 50-150%
    hover_effect: str = "none"  # none, grow, glow, rotate

class DifferentialCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    icon: str
    title: TranslatableText = Field(default_factory=lambda: TranslatableText())
    description: TranslatableText = Field(default_factory=lambda: TranslatableText())
    order: int = 0

class StatItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    value: str
    label: TranslatableText = Field(default_factory=lambda: TranslatableText())
    order: int = 0

class ContactInfo(BaseModel):
    address: str = "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100"
    phone: str = "+55 (11) 99999-9999"
    email: str = "contato@startrade.com.br"
    whatsapp: str = "+5511999999999"
    linkedin: str = "https://linkedin.com/company/startrade"
    instagram: str = "https://instagram.com/startrade"
    facebook: str = "https://facebook.com/startrade"
    youtube: str = ""
    tiktok: str = ""

class SiteColors(BaseModel):
    primary: str = "#1E3A8A"
    secondary: str = "#D4AF37"
    background: str = "#FFFFFF"
    text_primary: str = "#0F172A"

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    logo_url: str = "https://customer-assets.emergentagent.com/job_star-trade-intl/artifacts/7zqbrzwt_star%20trade.png"
    logo_dark_url: str = ""
    favicon_url: str = ""
    logo_settings: LogoSettings = Field(default_factory=LogoSettings)
    hero: HeroSettings = Field(default_factory=HeroSettings)
    about: AboutSettings = Field(default_factory=AboutSettings)
    differentials: List[DifferentialCard] = Field(default_factory=list)
    stats: List[StatItem] = Field(default_factory=list)
    contact: ContactInfo = Field(default_factory=ContactInfo)
    colors: SiteColors = Field(default_factory=SiteColors)
    default_language: str = "pt"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Areas
class AreaCreate(BaseModel):
    title: str
    title_en: str = ""
    title_es: str = ""
    description: str
    description_en: str = ""
    description_es: str = ""
    image_url: str
    icon: str
    is_specialty: bool = False
    badge_text: str = "Setor"
    badge_text_en: str = "Sector"
    badge_text_es: str = "Sector"
    badge_color: str = "#1E3A8A"
    overlay_color: str = "rgba(30, 58, 138, 0.7)"
    button_text: str = "Saiba Mais"
    button_text_en: str = "Learn More"
    button_text_es: str = "Saber Más"
    button_link: str = ""
    is_active: bool = True
    order: int = 0

class Area(AreaCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Blog
class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    cover_image: str = ""
    category: str = ""
    tags: List[str] = []
    is_featured: bool = False
    is_published: bool = True
    meta_title: str = ""
    meta_description: str = ""
    related_area_id: str = ""

class BlogPost(BlogPostCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str = ""
    author_name: str = "Admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Contact Messages
class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    company: str = ""
    message: str
    area_of_interest: str = ""

class ContactMessage(ContactMessageCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Media
class MediaFile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    url: str
    file_type: str
    size: int = 0
    folder: str = "general"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"user_id": user_id, "email": email, "exp": expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=data.email, name=data.name, role="admin")
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    token = create_token(user.id, user.email)
    
    return TokenResponse(access_token=token, user=UserBase(email=user.email, name=user.name, role=user.role))

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    return TokenResponse(
        access_token=token,
        user=UserBase(email=user["email"], name=user["name"], role=user.get("role", "editor"))
    )

@api_router.get("/auth/me", response_model=UserBase)
async def get_me(user: dict = Depends(get_current_user)):
    return UserBase(**user)

# ============ SITE SETTINGS ROUTES ============

def migrate_translatable_fields(data: dict, field_paths: list) -> dict:
    """Migrate old string fields to TranslatableText format"""
    for path in field_paths:
        parts = path.split(".")
        current = data
        for i, part in enumerate(parts[:-1]):
            if part in current and isinstance(current[part], dict):
                current = current[part]
            else:
                break
        else:
            final_key = parts[-1]
            if final_key in current:
                value = current[final_key]
                if isinstance(value, str):
                    current[final_key] = {"pt": value, "en": value, "es": value}
    return data

@api_router.get("/settings", response_model=SiteSettings)
async def get_settings():
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        default = SiteSettings()
        default.differentials = [
            DifferentialCard(
                icon="Users", 
                title=TranslatableText(pt="Equipe Especializada", en="Specialized Team", es="Equipo Especializado"), 
                description=TranslatableText(pt="Profissionais com vasta experiência em comércio exterior", en="Professionals with extensive experience in foreign trade", es="Profesionales con amplia experiencia en comercio exterior"), 
                order=0
            ),
            DifferentialCard(
                icon="Clock", 
                title=TranslatableText(pt="Agilidade", en="Agility", es="Agilidad"), 
                description=TranslatableText(pt="Processos otimizados para entregas no prazo", en="Optimized processes for on-time deliveries", es="Procesos optimizados para entregas a tiempo"), 
                order=1
            ),
            DifferentialCard(
                icon="Shield", 
                title=TranslatableText(pt="Segurança", en="Security", es="Seguridad"), 
                description=TranslatableText(pt="Gestão completa com total transparência", en="Complete management with total transparency", es="Gestión completa con total transparencia"), 
                order=2
            ),
        ]
        default.stats = [
            StatItem(value="500+", label=TranslatableText(pt="Importações Realizadas", en="Imports Completed", es="Importaciones Realizadas"), order=0),
            StatItem(value="1500+", label=TranslatableText(pt="Projetos Concluídos", en="Projects Completed", es="Proyectos Completados"), order=1),
            StatItem(value="50+", label=TranslatableText(pt="Containers/Mês", en="Containers/Month", es="Contenedores/Mes"), order=2),
            StatItem(value="8+", label=TranslatableText(pt="Anos de Experiência", en="Years of Experience", es="Años de Experiencia"), order=3),
        ]
        settings_dict = default.model_dump()
        settings_dict["updated_at"] = settings_dict["updated_at"].isoformat()
        await db.settings.insert_one(settings_dict)
        return default
    
    # Migrate old string fields to TranslatableText
    translatable_paths = [
        "hero.title", "hero.subtitle", "hero.cta_text",
        "about.title", "about.paragraph1", "about.paragraph2"
    ]
    settings = migrate_translatable_fields(settings, translatable_paths)
    
    # Migrate differentials
    if "differentials" in settings:
        for diff in settings["differentials"]:
            if isinstance(diff.get("title"), str):
                diff["title"] = {"pt": diff["title"], "en": diff["title"], "es": diff["title"]}
            if isinstance(diff.get("description"), str):
                diff["description"] = {"pt": diff["description"], "en": diff["description"], "es": diff["description"]}
    
    # Migrate stats
    if "stats" in settings:
        for stat in settings["stats"]:
            if isinstance(stat.get("label"), str):
                stat["label"] = {"pt": stat["label"], "en": stat["label"], "es": stat["label"]}
    
    if isinstance(settings.get("updated_at"), str):
        settings["updated_at"] = datetime.fromisoformat(settings["updated_at"])
    return SiteSettings(**settings)

@api_router.put("/settings", response_model=SiteSettings)
async def update_settings(settings: SiteSettings, user: dict = Depends(get_current_user)):
    settings.updated_at = datetime.now(timezone.utc)
    settings_dict = settings.model_dump()
    settings_dict["updated_at"] = settings_dict["updated_at"].isoformat()
    await db.settings.update_one({"id": "site_settings"}, {"$set": settings_dict}, upsert=True)
    return settings

# ============ AREAS ROUTES ============

@api_router.get("/areas", response_model=List[Area])
async def get_areas():
    areas = await db.areas.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    if not areas:
        # Seed default areas
        default_areas = [
            Area(
                title="Alimentos",
                description="Importação e exportação de produtos alimentícios, commodities agrícolas e insumos para a indústria alimentícia. Compliance sanitário e rastreabilidade total.",
                image_url="https://images.unsplash.com/photo-1650012048722-c81295ccbe79?q=85&w=800&auto=format&fit=crop",
                icon="Wheat",
                badge_text="Setor",
                order=0
            ),
            Area(
                title="Rochas Ornamentais",
                description="Especialistas em importação e exportação de mármores, granitos, quartzos e pedras naturais. Seleção criteriosa, logística especializada e assessoria técnica completa.",
                image_url="https://images.unsplash.com/photo-1585749864763-de34e7afde1b?q=85&w=800&auto=format&fit=crop",
                icon="Gem",
                is_specialty=True,
                badge_text="NOSSA ESPECIALIDADE",
                badge_color="#D4AF37",
                overlay_color="rgba(212, 175, 55, 0.7)",
                order=1
            ),
            Area(
                title="Comércio Digital",
                description="Soluções para e-commerce internacional: produtos eletrônicos, acessórios, gadgets e itens de tecnologia. Facilitamos vendas cross-border e operações B2C/B2B.",
                image_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=85&w=800&auto=format&fit=crop",
                icon="ShoppingCart",
                badge_text="Setor",
                order=2
            ),
            Area(
                title="Bicicletas Elétricas",
                description="Importação de e-bikes e componentes de mobilidade elétrica sustentável. Atendemos distribuidores e varejistas com soluções logísticas especializadas e suporte técnico.",
                image_url="https://images.unsplash.com/photo-1747866746076-689c5371e707?q=85&w=800&auto=format&fit=crop",
                icon="Bike",
                badge_text="Setor",
                order=3
            ),
        ]
        for area in default_areas:
            area_dict = area.model_dump()
            area_dict["created_at"] = area_dict["created_at"].isoformat()
            await db.areas.insert_one(area_dict)
        return default_areas
    
    for area in areas:
        if isinstance(area.get("created_at"), str):
            area["created_at"] = datetime.fromisoformat(area["created_at"])
    return [Area(**a) for a in areas]

@api_router.post("/areas", response_model=Area)
async def create_area(data: AreaCreate, user: dict = Depends(get_current_user)):
    area = Area(**data.model_dump())
    area_dict = area.model_dump()
    area_dict["created_at"] = area_dict["created_at"].isoformat()
    await db.areas.insert_one(area_dict)
    return area

@api_router.put("/areas/{area_id}", response_model=Area)
async def update_area(area_id: str, data: AreaCreate, user: dict = Depends(get_current_user)):
    existing = await db.areas.find_one({"id": area_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Area not found")
    
    update_data = data.model_dump()
    await db.areas.update_one({"id": area_id}, {"$set": update_data})
    
    updated = await db.areas.find_one({"id": area_id}, {"_id": 0})
    if isinstance(updated.get("created_at"), str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    return Area(**updated)

@api_router.delete("/areas/{area_id}")
async def delete_area(area_id: str, user: dict = Depends(get_current_user)):
    result = await db.areas.delete_one({"id": area_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Area not found")
    return {"message": "Area deleted"}

# ============ BLOG ROUTES ============

def generate_slug(title: str) -> str:
    import re
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug.strip('-')

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(published_only: bool = False):
    query = {"is_published": True} if published_only else {}
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for post in posts:
        if isinstance(post.get("created_at"), str):
            post["created_at"] = datetime.fromisoformat(post["created_at"])
        if isinstance(post.get("updated_at"), str):
            post["updated_at"] = datetime.fromisoformat(post["updated_at"])
    return [BlogPost(**p) for p in posts]

@api_router.get("/blog/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    post = await db.blog_posts.find_one({"$or": [{"id": post_id}, {"slug": post_id}]}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if isinstance(post.get("created_at"), str):
        post["created_at"] = datetime.fromisoformat(post["created_at"])
    if isinstance(post.get("updated_at"), str):
        post["updated_at"] = datetime.fromisoformat(post["updated_at"])
    return BlogPost(**post)

@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(data: BlogPostCreate, user: dict = Depends(get_current_user)):
    post = BlogPost(**data.model_dump())
    post.slug = generate_slug(data.title)
    post.author_name = user.get("name", "Admin")
    
    post_dict = post.model_dump()
    post_dict["created_at"] = post_dict["created_at"].isoformat()
    post_dict["updated_at"] = post_dict["updated_at"].isoformat()
    
    await db.blog_posts.insert_one(post_dict)
    return post

@api_router.put("/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, data: BlogPostCreate, user: dict = Depends(get_current_user)):
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = data.model_dump()
    update_data["slug"] = generate_slug(data.title)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    updated = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if isinstance(updated.get("created_at"), str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    if isinstance(updated.get("updated_at"), str):
        updated["updated_at"] = datetime.fromisoformat(updated["updated_at"])
    return BlogPost(**updated)

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, user: dict = Depends(get_current_user)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}

# ============ CONTACT MESSAGES ROUTES ============

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(data: ContactMessageCreate):
    message = ContactMessage(**data.model_dump())
    message_dict = message.model_dump()
    message_dict["created_at"] = message_dict["created_at"].isoformat()
    
    await db.contact_messages.insert_one(message_dict)
    # Mock email sending - in production, integrate with SendGrid/Resend
    logging.info(f"New contact message from {data.email}: {data.message[:50]}...")
    return message

@api_router.get("/messages", response_model=List[ContactMessage])
async def get_contact_messages(user: dict = Depends(get_current_user)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg.get("created_at"), str):
            msg["created_at"] = datetime.fromisoformat(msg["created_at"])
    return [ContactMessage(**m) for m in messages]

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str, user: dict = Depends(get_current_user)):
    result = await db.contact_messages.update_one({"id": message_id}, {"$set": {"is_read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Marked as read"}

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user: dict = Depends(get_current_user)):
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}

# ============ MEDIA ROUTES ============

@api_router.get("/media", response_model=List[MediaFile])
async def get_media_files(folder: str = None, user: dict = Depends(get_current_user)):
    query = {"folder": folder} if folder else {}
    files = await db.media.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for f in files:
        if isinstance(f.get("created_at"), str):
            f["created_at"] = datetime.fromisoformat(f["created_at"])
    return [MediaFile(**f) for f in files]

@api_router.post("/media/upload")
async def upload_media(file: UploadFile = File(...), folder: str = "general", user: dict = Depends(get_current_user)):
    # Mock upload - in production, use Cloudinary/S3
    content = await file.read()
    file_id = str(uuid.uuid4())
    
    # For demo, create a data URL (in production, upload to CDN)
    content_type = file.content_type or "application/octet-stream"
    b64 = base64.b64encode(content).decode()
    mock_url = f"data:{content_type};base64,{b64[:100]}..."  # Truncated for storage
    
    media_file = MediaFile(
        id=file_id,
        filename=file.filename,
        url=mock_url,
        file_type=content_type,
        size=len(content),
        folder=folder
    )
    
    media_dict = media_file.model_dump()
    media_dict["created_at"] = media_dict["created_at"].isoformat()
    await db.media.insert_one(media_dict)
    
    return {"message": "File uploaded", "file": media_file}

@api_router.delete("/media/{file_id}")
async def delete_media(file_id: str, user: dict = Depends(get_current_user)):
    result = await db.media.delete_one({"id": file_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File deleted"}

# ============ STATS ROUTES ============

@api_router.get("/stats/dashboard")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    total_messages = await db.contact_messages.count_documents({})
    unread_messages = await db.contact_messages.count_documents({"is_read": False})
    total_posts = await db.blog_posts.count_documents({})
    total_areas = await db.areas.count_documents({})
    
    return {
        "total_messages": total_messages,
        "unread_messages": unread_messages,
        "total_posts": total_posts,
        "total_areas": total_areas
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
