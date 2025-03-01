"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../lib/AuthContext";
import Link from "next/link";
import { SiAirplayaudio } from "react-icons/si";
import { FaRegFileAlt, FaSearch, FaCog, FaHeadset, FaRegStar, FaBook, FaCode, FaRobot, FaNewspaper, FaChartBar, FaFileDownload, FaClipboardList, FaArrowRight, FaPlus, FaHistory, FaFolder, FaHome, FaQuestion, FaBookmark, FaBars, FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { RiVipCrownLine, RiTimeLine } from "react-icons/ri";
import { MdOutlineDashboard, MdOutlineInfo, MdErrorOutline, MdOutlineAssignment, MdPictureAsPdf, MdOutlineScreenShare, MdFormatListBulleted } from "react-icons/md";
import { BsFileEarmarkText, BsFileEarmarkPpt, BsFileEarmarkWord, BsLightbulb } from "react-icons/bs";
import { createReport, checkReportStatus } from '../lib/dbUtils';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showFormats, setShowFormats] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("new");
  const [progressPercent, setProgressPercent] = useState(0);

  const handleReportTypeSelect = (type: string) => {
    setSelectedReportType(type);
    setInputValue("");
    setCurrentStep(2);
  };

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    
    if (currentStep === 2) {
      setCurrentStep(3);
      setShowFormats(true);
    }
  };

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    setCurrentStep(4);
    
    // Commencer la création du rapport avec Mainos
    createReportWithMainos(format);
  };

  // Fonction pour créer un rapport avec l'API Mainos
  const createReportWithMainos = async (format: string) => {
    try {
      // Réinitialiser la progression
      setProgressPercent(0);
      
      // Démarrer l'animation de progression
      const progressInterval = setInterval(() => {
        setProgressPercent(prev => {
          // Limiter à 95% maximum pour que l'utilisateur sache que ce n'est pas encore terminé
          if (prev < 95) {
            return prev + 1;
          }
          return prev;
        });
      }, 1000); // Incrémenter toutes les secondes
      
      const reportData = {
        title: inputValue || selectedReportType,
        type: selectedReportType,
        format: format,
      };
      
      // Créer le rapport
      const { data, error, mainosReportId } = await createReport(reportData);
      
      if (error) {
        clearInterval(progressInterval);
        throw error;
      }
      
      if (data && data.length > 0 && mainosReportId) {
        const reportId = data[0].id;
        
        // Configurer un intervalle pour vérifier le statut du rapport
        const statusInterval = setInterval(async () => {
          const { reportStatus, error } = await checkReportStatus(reportId, mainosReportId);
          
          if (error) {
            console.error('Erreur lors de la vérification du statut:', error);
            clearInterval(statusInterval);
            clearInterval(progressInterval);
            setCurrentStep(5); // Étape d'erreur
            return;
          }
          
          if (reportStatus === 'completed') {
            clearInterval(statusInterval);
            clearInterval(progressInterval);
            setProgressPercent(100); // Définir à 100% une fois terminé
            
            // Attendre un court moment pour que l'utilisateur voie la progression à 100%
            setTimeout(() => {
              // Rediriger vers la page de résultat du rapport
              router.push(`/report-result/${reportId}`);
            }, 500);
          }
        }, 5000); // Vérifier toutes les 5 secondes
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du rapport:', error);
      setCurrentStep(5); // Étape d'erreur
    }
  };

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    if (section !== "new") {
      setCurrentStep(1);
      setSelectedReportType("");
      setInputValue("");
      setShowFormats(false);
      setSelectedFormat("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md text-center">
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "new":
  return (
          <>
        {/* En-tête avec bouton de déconnexion */}
        <header className="border-b border-gray-800 sticky top-0 bg-[#1E1E1E] z-10">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-2 flex justify-between items-center">
            <h1 className="text-lg font-bold">MainOS</h1>
            
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <span className="text-sm hidden md:inline">
                    {user.email}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-[#3c3c3c] transition-colors"
                  >
                    <FaSignOutAlt />
                    <span className="hidden md:inline">Déconnexion</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Indicateur de progression */}
        <div className="border-b border-gray-800 overflow-x-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-6">
            <div className="flex items-center justify-between">
              <div className="relative flex items-center gap-10 md:gap-20 lg:gap-40">
                {/* Lignes de connexion */}
                <div className="absolute left-5 right-5 md:left-12 md:right-12 top-[22px] h-[2px] bg-gray-800">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ 
                      width: currentStep === 1 ? '0%' : 
                             currentStep === 2 ? '33%' : 
                             currentStep === 3 ? '66%' : '100%' 
                    }}
                  />
                </div>

                {/* Étape 1 */}
                <div className="relative z-10">
                  <div className={`flex flex-col items-center gap-2 md:gap-3 ${currentStep >= 1 ? 'text-white' : 'text-gray-600'}`}>
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStep > 1 ? 'bg-blue-500 text-white' : 
                        currentStep === 1 ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : 
                        'bg-gray-800 text-gray-500'}`}
                    >
                      <span className="text-xs md:text-sm font-medium">1</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium whitespace-nowrap">Type</span>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="relative z-10">
                  <div className={`flex flex-col items-center gap-2 md:gap-3 ${currentStep >= 2 ? 'text-white' : 'text-gray-600'}`}>
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStep > 2 ? 'bg-blue-500 text-white' : 
                        currentStep === 2 ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : 
                        'bg-gray-800 text-gray-500'}`}
                    >
                      <span className="text-xs md:text-sm font-medium">2</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium whitespace-nowrap">Contenu</span>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="relative z-10">
                  <div className={`flex flex-col items-center gap-2 md:gap-3 ${currentStep >= 3 ? 'text-white' : 'text-gray-600'}`}>
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStep > 3 ? 'bg-blue-500 text-white' : 
                        currentStep === 3 ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : 
                        'bg-gray-800 text-gray-500'}`}
                    >
                      <span className="text-xs md:text-sm font-medium">3</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium whitespace-nowrap">Format</span>
                  </div>
                </div>

                {/* Étape 4 */}
                <div className="relative z-10">
                  <div className={`flex flex-col items-center gap-2 md:gap-3 ${currentStep >= 4 ? 'text-white' : 'text-gray-600'}`}>
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStep === 4 ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : 
                        'bg-gray-800 text-gray-500'}`}
                    >
                      <span className="text-xs md:text-sm font-medium">4</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium whitespace-nowrap">Final</span>
                  </div>
                </div>
              </div>

              {currentStep > 1 && (
                <button 
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedReportType("");
                    setInputValue("");
                    setShowFormats(false);
                    setSelectedFormat("");
                  }}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-400 hover:text-white hover:bg-[#3c3c3c] rounded-md transition-colors ml-2 md:ml-0 flex-shrink-0"
                >
                  <FaArrowRight className="rotate-180 text-[10px] md:text-xs" />
                  <span className="hidden sm:inline">Recommencer</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Titre dynamique selon l'étape */}
        <div className="p-4 md:p-6 mt-4 md:mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
            {currentStep === 1 && "Créer un nouveau rapport"}
            {currentStep === 2 && `Définir le contenu: ${selectedReportType}`}
            {currentStep === 3 && "Choisir le format de sortie"}
            {currentStep === 4 && "Génération en cours..."}
          </h1>
          <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto">
            {currentStep === 1 && "Sélectionnez le type de rapport que vous souhaitez créer"}
            {currentStep === 2 && "Décrivez précisément le sujet et les points importants à inclure"}
            {currentStep === 3 && "Dans quel format souhaitez-vous recevoir votre document ?"}
            {currentStep === 4 && "Mainos travaille sur votre rapport, veuillez patienter..."}
          </p>
        </div>

        {/* Contenu principal qui change selon l'étape */}
        <div className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto">
          {/* Étape 1: Choix du type de rapport */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
                <button 
                  onClick={() => handleReportTypeSelect("Analyse de marché")}
                  className="bg-[#2c2c2c] p-5 rounded-lg text-left hover:bg-[#333333] transition-all duration-300 border border-transparent hover:border-gray-700 hover:shadow-lg hover:shadow-blue-900/5 transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1 hover:bg-[#444444] transition-colors">
                      <FaChartBar className="text-lg text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Analyse de marché</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        Analyse détaillée d'un secteur d'activité avec données clés et insights stratégiques.
                      </p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleReportTypeSelect("Rapport SWOT")}
                  className="bg-[#2c2c2c] p-5 rounded-lg text-left hover:bg-[#333333] transition-all duration-300 border border-transparent hover:border-gray-700 hover:shadow-lg hover:shadow-green-900/5 transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1 hover:bg-[#444444] transition-colors">
                      <FaClipboardList className="text-lg text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Rapport SWOT</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        Analyse des forces, faiblesses, opportunités et menaces pour votre entreprise ou projet.
                      </p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleReportTypeSelect("Newsletter")}
                  className="bg-[#2c2c2c] p-5 rounded-lg text-left hover:bg-[#333333] transition-all duration-300 border border-transparent hover:border-gray-700 hover:shadow-lg hover:shadow-purple-900/5 transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1 hover:bg-[#444444] transition-colors">
                      <FaNewspaper className="text-lg text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Newsletter</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        Bulletin d'information sur un sujet spécifique, adapté à votre audience cible.
                      </p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleReportTypeSelect("Cours/Tutoriel")}
                  className="bg-[#2c2c2c] p-5 rounded-lg text-left hover:bg-[#333333] transition-all duration-300 border border-transparent hover:border-gray-700 hover:shadow-lg hover:shadow-amber-900/5 transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1 hover:bg-[#444444] transition-colors">
                      <FaBook className="text-lg text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Cours/Tutoriel</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        Contenu éducatif structuré, adapté à différents niveaux et besoins d'apprentissage.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Étape 2: Définition du contenu */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto flex justify-center">
              <div className="w-full">
                <div className="bg-[#2c2c2c] p-5 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0">
                      <BsLightbulb className="text-sm" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Conseils pour votre {selectedReportType}</h3>
                      <div className="text-xs text-gray-300 space-y-2">
                        {selectedReportType === "Analyse de marché" && (
                          <>
                            <p>• Précisez le secteur ou marché à analyser</p>
                            <p>• Mentionnez la période concernée</p>
                            <p>• Indiquez si vous avez besoin de données spécifiques</p>
                            <p>• Précisez la zone géographique si pertinent</p>
                          </>
                        )}
                        {selectedReportType === "Rapport SWOT" && (
                          <>
                            <p>• Nommez l'entreprise, produit ou projet à analyser</p>
                            <p>• Mentionnez le contexte actuel</p>
                            <p>• Précisez les aspects spécifiques à étudier</p>
                            <p>• Indiquez si vous souhaitez des recommandations</p>
                          </>
                        )}
                        {selectedReportType === "Newsletter" && (
                          <>
                            <p>• Définissez le thème principal</p>
                            <p>• Précisez le public cible</p>
                            <p>• Indiquez le ton souhaité</p>
                            <p>• Mentionnez les points importants à couvrir</p>
                          </>
                        )}
                        {selectedReportType === "Cours/Tutoriel" && (
                          <>
                            <p>• Définissez le sujet et le niveau</p>
                            <p>• Précisez les prérequis éventuels</p>
                            <p>• Indiquez si vous souhaitez des exercices pratiques</p>
                            <p>• Mentionnez le niveau de détail souhaité</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#2c2c2c] p-5 rounded-lg">
                    <h3 className="font-medium mb-3">Détaillez votre demande</h3>
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Décrivez précisément le contenu souhaité pour votre ${selectedReportType}...`}
                      className="w-full bg-[#1c1c1c] rounded-md py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 min-h-[150px] resize-none"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-gray-400">
                        {inputValue.length > 0 ? `${inputValue.length} caractères` : "Plus votre description est précise, meilleur sera le résultat"}
                      </div>
                      <button 
                        onClick={handleSend}
                        disabled={inputValue.trim() === ""}
                        className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${inputValue.trim() === "" ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                      >
                        <span>Continuer</span>
                        <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Étape 3: Choix du format */}
          {currentStep === 3 && showFormats && (
            <div className="max-w-4xl mx-auto flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
                <button 
                  onClick={() => handleFormatSelect("PDF")}
                  className={`bg-[#2c2c2c] p-5 rounded-lg text-left transition-colors border ${selectedFormat === "PDF" ? 'border-gray-500 bg-[#333333]' : 'border-transparent hover:border-gray-700 hover:bg-[#333333]'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <MdPictureAsPdf className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Document PDF</h3>
                      <p className="text-xs text-gray-400 mb-1">
                        Format professionnel pour le partage et l'impression
                      </p>
                      <p className="text-xs text-gray-500">
                        Mise en page soignée et structure claire
                      </p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleFormatSelect("DOCX")}
                  className={`bg-[#2c2c2c] p-5 rounded-lg text-left transition-colors border ${selectedFormat === "DOCX" ? 'border-gray-500 bg-[#333333]' : 'border-transparent hover:border-gray-700 hover:bg-[#333333]'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <BsFileEarmarkWord className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Document Word</h3>
                      <p className="text-xs text-gray-400 mb-1">
                        Format éditable pour modifier le contenu facilement
                      </p>
                      <p className="text-xs text-gray-500">
                        Compatible avec Microsoft Word et alternatives
                      </p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleFormatSelect("MD")}
                  className={`bg-[#2c2c2c] p-5 rounded-lg text-left transition-colors border ${selectedFormat === "MD" ? 'border-gray-500 bg-[#333333]' : 'border-transparent hover:border-gray-700 hover:bg-[#333333]'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <BsFileEarmarkText className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Markdown</h3>
                      <p className="text-xs text-gray-400 mb-1">
                        Format texte léger idéal pour sites web et wikis
                      </p>
                      <p className="text-xs text-gray-500">
                        Compatible avec GitHub, Notion et autres plateformes
                      </p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleFormatSelect("PPTX")}
                  className={`bg-[#2c2c2c] p-5 rounded-lg text-left transition-colors border ${selectedFormat === "PPTX" ? 'border-gray-500 bg-[#333333]' : 'border-transparent hover:border-gray-700 hover:bg-[#333333]'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3c3c3c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <BsFileEarmarkPpt className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Présentation PowerPoint</h3>
                      <p className="text-xs text-gray-400 mb-1">
                        Format idéal pour les présentations visuelles
                      </p>
                      <p className="text-xs text-gray-500">
                        Structure en diapositives avec points clés mis en avant
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Étape 4: Génération en cours */}
          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#2c2c2c] p-6 rounded-lg text-center">
                <div className="mx-auto w-16 h-16 border-4 border-t-gray-500 border-r-gray-500 border-b-gray-800 border-l-gray-800 rounded-full animate-spin mb-4"></div>
                <h3 className="font-medium text-lg mb-1">Création de votre {selectedReportType} en format {selectedFormat}</h3>
                <p className="text-sm text-gray-400 mb-6">Traitement en cours, veuillez patienter...</p>
                
                {/* Barre de progression */}
                <div className="mb-6">
                  <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Progression</span>
                    <span>{progressPercent}%</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-left border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <MdFormatListBulleted className="text-xs" />
                    </div>
                    <span>Création du plan</span>
                    <div className="ml-auto text-green-500 text-xs">Terminé</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <FaSearch className="text-xs" />
                    </div>
                    <span>Recherche d'informations</span>
                    <div className="ml-auto text-green-500 text-xs">Terminé</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-6 h-6 ${progressPercent >= 30 ? 'bg-gray-600' : 'bg-gray-800'} rounded-full flex items-center justify-center`}>
                      <MdOutlineAssignment className="text-xs" />
                    </div>
                    <span>Rédaction du contenu</span>
                    <div className="ml-auto flex items-center text-xs">
                      {progressPercent >= 75 ? (
                        <span className="text-green-500">Terminé</span>
                      ) : progressPercent >= 30 ? (
                        <span className="text-yellow-500">En cours</span>
                      ) : (
                        <span className="text-gray-500">En attente</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-6 h-6 ${progressPercent >= 75 ? 'bg-gray-600' : 'bg-gray-800'} rounded-full flex items-center justify-center`}>
                      <MdOutlineInfo className="text-xs" />
                    </div>
                    <span>Vérification</span>
                    <div className="ml-auto flex items-center text-xs">
                      {progressPercent >= 90 ? (
                        <span className="text-green-500">Terminé</span>
                      ) : progressPercent >= 75 ? (
                        <span className="text-yellow-500">En cours</span>
                      ) : (
                        <span className="text-gray-500">En attente</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-6 h-6 ${progressPercent >= 90 ? 'bg-gray-600' : 'bg-gray-800'} rounded-full flex items-center justify-center`}>
                      <FaFileDownload className="text-xs" />
                    </div>
                    <span>Finalisation</span>
                    <div className="ml-auto flex items-center text-xs">
                      {progressPercent >= 100 ? (
                        <span className="text-green-500">Terminé</span>
                      ) : progressPercent >= 90 ? (
                        <span className="text-yellow-500">En cours</span>
                      ) : (
                        <span className="text-gray-500">En attente</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Étape 5: Erreur */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#2c2c2c] p-6 rounded-lg text-center">
                <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
                  <MdErrorOutline className="text-red-500 text-5xl" />
                </div>
                <h3 className="font-medium text-lg mb-1">Une erreur est survenue</h3>
                <p className="text-sm text-gray-400 mb-6">Impossible de générer votre rapport pour le moment.</p>
                
                <button 
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedReportType("");
                    setInputValue("");
                    setShowFormats(false);
                    setSelectedFormat("");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}
        </div>
          </>
        );
      case "reports":
        return (
          <div className="p-4 md:p-8">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Mes Rapports</h1>
            <div className="grid gap-4">
              {/* Les rapports seront chargés dynamiquement ici */}
              <div className="bg-[#2c2c2c] p-6 rounded-lg text-center">
                <p className="text-gray-400">Aucun rapport disponible</p>
                <button 
                  onClick={() => handleNavigation("new")}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <FaPlus className="text-xs" />
                  <span>Créer un nouveau rapport</span>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Barre latérale - masquée par défaut sur mobile, affichable avec un bouton */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-full md:w-64'} bg-[#2c2c2c] text-white flex flex-col transition-all duration-300 ${activeSection === "sidebar-open" ? 'fixed inset-0 z-50' : 'hidden md:flex'}`}>
        {/* En-tête de la barre latérale */}
        <div className="p-4 flex items-center gap-2 border-b border-gray-700">
          <SiAirplayaudio className="text-xl" />
          {!sidebarCollapsed && <h1 className="text-xl font-bold">Mainos</h1>}
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                handleNavigation(activeSection === "sidebar-open" ? "new" : "sidebar-open");
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }} 
            className="ml-auto text-gray-400 hover:text-white transition-colors rounded-full p-1.5 hover:bg-[#3c3c3c]"
            aria-label={sidebarCollapsed ? "Déplier le menu" : "Replier le menu"}
          >
            {activeSection === "sidebar-open" || sidebarCollapsed ? <FaChevronRight className="text-sm" /> : <FaChevronLeft className="text-sm" />}
          </button>
        </div>

        {/* Navigation principale simplifiée */}
        <nav className="p-4 space-y-3">
          <button 
            onClick={() => handleNavigation("new")}
            className={`flex items-center gap-3 p-2 w-full ${activeSection === "new" ? 'bg-[#3c3c3c]' : 'hover:bg-[#3c3c3c]'} rounded-md`}
          >
            <FaPlus className="text-lg" />
            {!sidebarCollapsed && <span>Nouveau rapport</span>}
          </button>
          <button 
            onClick={() => handleNavigation("reports")}
            className={`flex items-center gap-3 p-2 w-full ${activeSection === "reports" ? 'bg-[#3c3c3c]' : 'hover:bg-[#3c3c3c]'} rounded-md`}
          >
            <FaFolder className="text-lg" />
            {!sidebarCollapsed && <span>Mes rapports</span>}
          </button>
        </nav>

        {/* Rapports récents - déplacé sous la navigation */}
        {!sidebarCollapsed && (
          <div className="px-4 pb-4">
            <h2 className="text-sm font-semibold mb-3 text-gray-400">Rapports récents</h2>
            <div className="space-y-1">
              {/* Les rapports seront chargés dynamiquement ici */}
              <div className="text-xs text-gray-500 py-2 text-center">
                Aucun rapport récent
              </div>
            </div>
          </div>
        )}

        {/* Profil utilisateur */}
        <div className={`mt-auto p-4 border-t border-gray-700 flex ${sidebarCollapsed ? 'justify-center' : 'flex-col'}`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
              <span className="text-xs">U</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                  <span className="text-xs">U</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Utilisateur</p>
                  <p className="text-xs text-gray-400">Standard</p>
                </div>
              </div>
              <Link href="/settings" className="block w-full py-1.5 bg-gray-600 rounded-md text-sm hover:bg-gray-700 transition text-center">
                Paramètres
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col bg-[#1c1c1c] text-white overflow-hidden">
        {/* Header mobile uniquement */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <SiAirplayaudio className="text-xl" />
            <h1 className="text-xl font-bold">Mainos</h1>
          </div>
          <button 
            onClick={() => handleNavigation("sidebar-open")}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-[#3c3c3c] transition-colors"
            aria-label="Ouvrir le menu"
          >
            <FaBars className="text-lg" />
          </button>
        </div>
        
        {/* Contenu dynamique */}
        {renderContent()}
      </div>
    </div>
  );
}
