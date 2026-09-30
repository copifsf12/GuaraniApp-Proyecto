import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function CertificateScreen({ onClose }) {
  const { theme, isDark } = useTheme();
  const { user, units } = useApp();
  const isPrintingRef = useRef(false);

  const userName = user?.username || 'Estudiante';
  const userXp = user?.xpTotal || 0;
  const wordsLearned = user?.wordsLearned || 0;
  const completedLessons = user?.completedLessons?.length || 0;
  const streakDays = user?.streakDays || 0;
  const dialectVariant = user?.dialectVariant || 'ava';

  const dialectName = {
    'ava': 'Ava Guaraní',
    'izoceño': 'Izoceño-Guaraní',
    'simba': 'Simba Guaraní',
  }[dialectVariant] || 'Ava Guaraní';

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // 🎨 Generar HTML del certificado (LAYOUT CORREGIDO)
  const generateCertificateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              background: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
            .certificate {
              width: 100%;
              max-width: 1100px;
              aspect-ratio: 297 / 210;
              background: #FFFDF8;
              border: 16px solid #2D6A4F;
              border-radius: 4px;
              padding: 8px;
              box-shadow: 0 0 40px rgba(0,0,0,0.15);
            }
            .inner-border {
              border: 3px solid #E9C46A;
              border-radius: 6px;
              height: 100%;
              padding: 24px 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              position: relative;
              background: #FFFDF8;
            }

            /* Esquinas decorativas */
            .corner {
              position: absolute;
              width: 50px;
              height: 50px;
              border: 3px solid #2D6A4F;
            }
            .corner-tl { top: 15px; left: 15px; border-right: none; border-bottom: none; }
            .corner-tr { top: 15px; right: 15px; border-left: none; border-bottom: none; }
            .corner-bl { bottom: 15px; left: 15px; border-right: none; border-top: none; }
            .corner-br { bottom: 15px; right: 15px; border-left: none; border-top: none; }

            /* ═══ SECCIÓN SUPERIOR ═══ */
            .top-section {
              width: 100%;
              text-align: center;
              padding-top: 10px;
            }
            .emoji-top {
              font-size: 44px;
              line-height: 1;
              margin-bottom: 6px;
            }
            .institution {
              font-size: 11px;
              letter-spacing: 4px;
              color: #C85A32;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .title {
              font-size: 38px;
              font-weight: 900;
              color: #2D6A4F;
              letter-spacing: 4px;
              text-transform: uppercase;
              line-height: 1;
              margin-bottom: 6px;
            }
            .subtitle {
              font-size: 12px;
              color: #635345;
              font-style: italic;
            }

            /* ═══ SECCIÓN MEDIA ═══ */
            .middle-section {
              width: 100%;
              text-align: center;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding: 8px 0;
            }
            .presented-to {
              font-size: 10px;
              color: #968574;
              letter-spacing: 3px;
              text-transform: uppercase;
              margin-bottom: 6px;
            }
            .student-name {
              font-size: 36px;
              font-weight: 900;
              color: #1E1E1E;
              display: inline-block;
              border-bottom: 3px solid #E9C46A;
              padding: 0 30px 6px 30px;
              margin-bottom: 6px;
              line-height: 1.1;
            }
            .student-email {
              font-size: 11px;
              color: #968574;
              margin-bottom: 12px;
            }
            .description {
              font-size: 12px;
              color: #635345;
              max-width: 650px;
              margin: 0 auto 12px auto;
              line-height: 1.5;
            }
            .variant-badge {
              display: inline-block;
              background: #D8F3DC;
              color: #2D6A4F;
              padding: 6px 18px;
              border-radius: 18px;
              font-size: 11px;
              font-weight: 700;
              border: 2px solid #52B788;
            }

            /* ═══ ESTADÍSTICAS ═══ */
            .stats {
              display: flex;
              justify-content: center;
              gap: 40px;
              margin: 12px 0;
            }
            .stat {
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: 900;
              color: #C85A32;
              line-height: 1;
            }
            .stat-label {
              font-size: 9px;
              color: #968574;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-top: 4px;
              font-weight: 600;
            }

            /* ═══ SECCIÓN INFERIOR ═══ */
            .bottom-section {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding: 0 10px;
              margin-top: 8px;
            }
            .signature {
              text-align: center;
              min-width: 150px;
            }
            .signature-line {
              width: 130px;
              border-top: 2px solid #1E1E1E;
              margin: 0 auto 5px auto;
            }
            .signature-name {
              font-size: 11px;
              font-weight: 700;
              color: #1E1E1E;
            }
            .signature-role {
              font-size: 9px;
              color: #968574;
              margin-top: 2px;
            }
            .date-center {
              text-align: center;
              flex: 1;
            }
            .date-value {
              font-size: 13px;
              font-weight: 700;
              color: #1E1E1E;
            }
            .date-label {
              font-size: 9px;
              color: #968574;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-top: 4px;
            }

            /* ═══ ID DEL CERTIFICADO ═══ */
            .id-code {
              position: absolute;
              bottom: 8px;
              right: 15px;
              font-size: 8px;
              color: #B7A896;
              font-family: 'Courier New', monospace;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="inner-border">
              <div class="corner corner-tl"></div>
              <div class="corner corner-tr"></div>
              <div class="corner corner-bl"></div>
              <div class="corner corner-br"></div>

              <!-- SECCIÓN SUPERIOR -->
              <div class="top-section">
                <div class="emoji-top">🎓</div>
                <div class="institution">Ava Guaraní · Chaco Boliviano</div>
                <div class="title">Certificado</div>
                <div class="subtitle">de Finalización del Curso de Guaraní Oriental Boliviano</div>
              </div>

              <!-- SECCIÓN MEDIA -->
              <div class="middle-section">
                <div class="presented-to">Se otorga el presente certificado a</div>
                <div class="student-name">${userName}</div>
                <div class="student-email">${user?.email || ''}</div>
                <div class="description">
                  Por haber completado exitosamente todas las lecciones del curso de <strong>Guaraní Oriental Boliviano</strong>,
                  demostrando dedicación, constancia y amor por la cultura chaqueña.
                </div>
                <div class="variant-badge">🌿 Variante: ${dialectName}</div>

                <!-- Estadísticas -->
                <div class="stats">
                  <div class="stat">
                    <div class="stat-value">${completedLessons}</div>
                    <div class="stat-label">Lecciones</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">${userXp}</div>
                    <div class="stat-label">XP Total</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">${wordsLearned}</div>
                    <div class="stat-label">Palabras</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">${streakDays}</div>
                    <div class="stat-label">Días Racha</div>
                  </div>
                </div>
              </div>

              <!-- SECCIÓN INFERIOR -->
              <div class="bottom-section">
                <div class="signature">
                  <div class="signature-line"></div>
                  <div class="signature-name">Ava Guaraní App</div>
                  <div class="signature-role">Plataforma Educativa</div>
                </div>

                <div class="date-center">
                  <div class="date-value">${formattedDate}</div>
                  <div class="date-label">Fecha de Emisión</div>
                </div>

                <div class="signature">
                  <div class="signature-line"></div>
                  <div class="signature-name">Comunidad Izoceña</div>
                  <div class="signature-role">Guardianes del Idioma</div>
                </div>
              </div>

              <!-- ID del certificado -->
              <div class="id-code">ID: CERT-${Date.now().toString(36).toUpperCase()}</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // 📄 Generar PDF y compartir
  const handleDownloadPDF = async () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    try {
      const html = generateCertificateHTML();

      if (Platform.OS === 'web') {
        // En web, abrir en nueva ventana
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      } else {
        // En celular, generar PDF
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
        });

        // Verificar si se puede compartir
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Tu Certificado de Guaraní',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            '✅ Certificado generado',
            `El certificado se guardó en:\n${uri}`,
            [{ text: '¡Genial!' }]
          );
        }
      }
    } catch (e) {
      console.warn('Error generando PDF:', e);
      Alert.alert('Error', 'No se pudo generar el certificado. Intenta de nuevo.');
    } finally {
      isPrintingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.sandBackground }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : theme.sandBorder }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="close" size={24} color={isDark ? '#F5F5F5' : theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
          Certificado
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Preview del certificado */}
        <View style={styles.previewWrapper}>
          <View style={styles.previewCard}>
            {/* Preview simplificado */}
            <LinearGradient
              colors={['#FFFDF8', '#FFF8F0']}
              style={styles.previewBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.previewInner}>
                <Text style={styles.previewEmoji}>🎓</Text>
                <Text style={styles.previewInstitution}>AVA GUARANÍ · CHACO BOLIVIANO</Text>
                <Text style={styles.previewTitle}>CERTIFICADO</Text>
                <Text style={styles.previewSubtitle}>
                  de Finalización del Curso de Guaraní Oriental
                </Text>
                <Text style={styles.previewPresented}>Se otorga a</Text>
                <Text style={styles.previewName}>{userName}</Text>
                <Text style={styles.previewVariant}>🌿 {dialectName}</Text>

                <View style={styles.previewStats}>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatValue}>{completedLessons}</Text>
                    <Text style={styles.previewStatLabel}>LECCIONES</Text>
                  </View>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatValue}>{userXp}</Text>
                    <Text style={styles.previewStatLabel}>XP</Text>
                  </View>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatValue}>{wordsLearned}</Text>
                    <Text style={styles.previewStatLabel}>PALABRAS</Text>
                  </View>
                </View>

                <Text style={styles.previewDate}>{formattedDate}</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : theme.sandBorder,
        }]}>
          <Ionicons name="ribbon" size={32} color={theme.solGold} />
          <Text style={[styles.infoTitle, { color: isDark ? '#F5F5F5' : theme.textPrimary }]}>
            ¡Felicitaciones, {userName}!
          </Text>
          <Text style={[styles.infoText, { color: isDark ? '#B0B0B0' : theme.textSecondary }]}>
            Has completado todas las lecciones del curso de Guaraní Oriental Boliviano.
            Descarga tu certificado y compártelo con orgullo. 🎉
          </Text>
        </View>
      </ScrollView>

      {/* Botón flotante */}
      <View style={[styles.bottomBar, {
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderTopColor: isDark ? '#333' : theme.sandBorder,
      }]}>
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={handleDownloadPDF}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#2D6A4F', '#1E5E3A']}
            style={styles.downloadBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="download" size={22} color="#FFFFFF" />
            <Text style={styles.downloadBtnText}>Descargar PDF</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '900' },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Preview
  previewWrapper: {
    marginBottom: 24,
  },
  previewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#2D6A4F',
  },
  previewBorder: {
    padding: 8,
  },
  previewInner: {
    borderWidth: 2,
    borderColor: '#E9C46A',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
  },
  previewEmoji: { fontSize: 40, marginBottom: 8 },
  previewInstitution: {
    fontSize: 8,
    fontWeight: '900',
    color: '#C85A32',
    letterSpacing: 2,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D6A4F',
    letterSpacing: 2,
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 10,
    color: '#635345',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  previewPresented: {
    fontSize: 8,
    color: '#968574',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E1E1E',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E9C46A',
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  previewVariant: {
    fontSize: 11,
    color: '#2D6A4F',
    fontWeight: '700',
    marginBottom: 16,
  },
  previewStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  previewStat: { alignItems: 'center' },
  previewStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#C85A32',
  },
  previewStatLabel: {
    fontSize: 7,
    color: '#968574',
    letterSpacing: 1,
    marginTop: 2,
  },
  previewDate: {
    fontSize: 9,
    color: '#968574',
    fontStyle: 'italic',
  },

  // Info
  infoCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 2,
  },
  downloadBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  downloadBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});