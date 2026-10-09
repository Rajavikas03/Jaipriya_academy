"""
Pronunciation Evaluation Service for JaiPriya Academy.

Provides pronunciation scoring using an external speech assessment engine (e.g. Azure Speech Services Pronunciation Assessment).
If API credentials are not configured, it transitions attempts to PENDING_EVALUATION state with clear feedback,
strictly avoiding the generation of fake or randomized scores.
"""

import os
import logging

logger = logging.getLogger(__name__)


def evaluate_spoken_recording(audio_file_path, reference_text):
    """
    Evaluates a student's recorded audio file against the expected reference text.
    
    Returns:
        dict: {
            'status': 'EVALUATED' | 'PENDING_EVALUATION',
            'overall_score': float or None,
            'pronunciation_score': float or None,
            'clarity_score': float or None,
            'transcription': str,
            'feedback': str
        }
    """
    azure_key = os.environ.get('AZURE_SPEECH_KEY')
    azure_region = os.environ.get('AZURE_SPEECH_REGION')

    if not azure_key or not azure_region:
        logger.info(
            "Speech assessment API credentials not configured. "
            "Marking recording as PENDING_EVALUATION for instructor review."
        )
        return {
            'status': 'PENDING_EVALUATION',
            'overall_score': None,
            'pronunciation_score': None,
            'clarity_score': None,
            'transcription': '',
            'feedback': 'Your voice recording has been safely submitted for instructor pronunciation review.'
        }

    try:
        # If azure-cognitiveservices-speech is installed and configured
        import azure.cognitiveservices.speech as speechsdk

        speech_config = speechsdk.SpeechConfig(subscription=azure_key, region=azure_region)
        audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)

        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.FullText,
            enable_miscue=True
        )

        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        pronunciation_config.apply_to(speech_recognizer)

        result = speech_recognizer.recognize_once()

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            pronunciation_result = speechsdk.PronunciationAssessmentResult(result)
            accuracy = pronunciation_result.accuracy_score
            fluency = pronunciation_result.fluency_score
            completeness = pronunciation_result.completeness_score
            pronunciation = pronunciation_result.pronunciation_score

            overall = round((accuracy + fluency + pronunciation) / 3.0, 1)

            return {
                'status': 'EVALUATED',
                'overall_score': overall,
                'pronunciation_score': round(pronunciation, 1),
                'clarity_score': round(accuracy, 1),
                'transcription': result.text,
                'feedback': f'Pronunciation: {pronunciation}%, Accuracy: {accuracy}%, Fluency: {fluency}%'
            }
        else:
            return {
                'status': 'PENDING_EVALUATION',
                'overall_score': None,
                'pronunciation_score': None,
                'clarity_score': None,
                'transcription': '',
                'feedback': 'Audio received. Speech could not be automatically scored; submitted for instructor review.'
            }

    except Exception as e:
        logger.warning(f"Error executing speech recognition evaluation: {e}")
        return {
            'status': 'PENDING_EVALUATION',
            'overall_score': None,
            'pronunciation_score': None,
            'clarity_score': None,
            'transcription': '',
            'feedback': 'Recording received and queued for instructor evaluation.'
        }


def evaluate_test_attempt(test_attempt):
    """
    Evaluates all recordings in a test attempt and computes aggregate statistics.
    """
    recordings = test_attempt.recordings.all().select_related('content_item')
    total_recordings = recordings.count()

    if total_recordings == 0:
        test_attempt.status = 'SUBMITTED'
        test_attempt.feedback = 'No recordings were submitted for this assessment.'
        test_attempt.save()
        return test_attempt

    evaluated_scores = []
    pronunciation_scores = []
    clarity_scores = []
    has_pending = False

    for rec in recordings:
        if rec.recorded_audio:
            eval_res = evaluate_spoken_recording(
                rec.recorded_audio.path,
                rec.content_item.text_content
            )
            rec.status = eval_res['status']
            rec.pronunciation_score = eval_res['pronunciation_score']
            rec.clarity_score = eval_res['clarity_score']
            rec.transcription = eval_res['transcription']
            rec.feedback = eval_res['feedback']
            rec.save()

            if eval_res['status'] == 'EVALUATED' and eval_res['overall_score'] is not None:
                evaluated_scores.append(eval_res['overall_score'])
                if eval_res['pronunciation_score'] is not None:
                    pronunciation_scores.append(eval_res['pronunciation_score'])
                if eval_res['clarity_score'] is not None:
                    clarity_scores.append(eval_res['clarity_score'])
            else:
                has_pending = True

    if evaluated_scores and not has_pending:
        test_attempt.status = 'EVALUATED'
        test_attempt.overall_score = round(sum(evaluated_scores) / len(evaluated_scores), 1)
        test_attempt.pronunciation_score = round(sum(pronunciation_scores) / len(pronunciation_scores), 1) if pronunciation_scores else None
        test_attempt.clarity_score = round(sum(clarity_scores) / len(clarity_scores), 1) if clarity_scores else None
        test_attempt.feedback = f'Overall Score: {test_attempt.overall_score}%. Excellent effort!'
    else:
        test_attempt.status = 'PENDING_EVALUATION'
        test_attempt.overall_score = None
        test_attempt.pronunciation_score = None
        test_attempt.clarity_score = None
        test_attempt.feedback = 'Your spoken test has been successfully recorded and submitted for teacher review.'

    test_attempt.save()
    return test_attempt
