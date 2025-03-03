import axios from 'axios';
import { MeasurementEvaluation, EvaluationStatus } from '../entities/MeasurementEvaluation';
import { AppDataSource } from '../config/database';
import { EvaluationHistory, ChangeType } from '../entities/EvaluationHistory';

/**
 * Service for validating evidence provided in evaluations
 */
export class EvidenceValidator {
  /**
   * Validate the evidence for an evaluation
   * @param evaluation The evaluation to validate
   * @returns Validation report
   */
  public static async validateEvidence(evaluation: MeasurementEvaluation): Promise<string> {
    // Skip validation if no evidence location is provided
    if (!evaluation.evidenceLocation) {
      return JSON.stringify({
        valid: false,
        message: 'No evidence location provided',
        checks: []
      });
    }

    const validationReport = {
      valid: true,
      message: 'All checks passed',
      checks: [] as any[]
    };

    // Run URL validator if evidence is a URL
    if (this.isURL(evaluation.evidenceLocation)) {
      try {
        // Check if URL is valid
        const urlCheck = await this.validateURL(evaluation.evidenceLocation);
        validationReport.checks.push(urlCheck);

        // Check if URL has content
        if (urlCheck.valid) {
          const contentCheck = await this.validateURLContent(evaluation.evidenceLocation);
          validationReport.checks.push(contentCheck);

          if (!contentCheck.valid) {
            validationReport.valid = false;
            validationReport.message = 'Some checks failed';
          }
        } else {
          validationReport.valid = false;
          validationReport.message = 'Some checks failed';
        }
      } catch (error) {
        console.error('Error validating URL:', error);
        validationReport.valid = false;
        validationReport.message = 'Error during validation';
        validationReport.checks.push({
          name: 'url_validation',
          valid: false,
          message: 'Error during URL validation'
        });
      }
    }

    // Run notes quality check
    if (evaluation.notes) {
      const notesCheck = this.validateNotesQuality(evaluation.notes);
      validationReport.checks.push(notesCheck);

      if (!notesCheck.valid) {
        validationReport.valid = false;
        validationReport.message = 'Some checks failed';
      }
    } else {
      validationReport.checks.push({
        name: 'notes_quality',
        valid: false,
        message: 'No notes provided'
      });
    }

    // Save validation report to evaluation
    evaluation.validationReport = JSON.stringify(validationReport);

    // If validation passed, update status to IMPLEMENTED
    // If validation failed, update status to EVIDENCE_REJECTED
    if (evaluation.status === EvaluationStatus.VALIDATING_EVIDENCE) {
      const previousStatus = evaluation.status;
      
      if (validationReport.valid) {
        evaluation.status = EvaluationStatus.IMPLEMENTED;
      } else {
        evaluation.status = EvaluationStatus.EVIDENCE_REJECTED;
      }

      // Record this change in history
      const historyEntry = new EvaluationHistory();
      historyEntry.evaluation = evaluation;
      historyEntry.changeType = ChangeType.VALIDATION_RESULT;
      historyEntry.previousStatus = previousStatus;
      historyEntry.newStatus = evaluation.status;
      historyEntry.validationResults = JSON.stringify(validationReport);
      historyEntry.changeReason = 'Automated validation process';

      // Save the history entry
      await AppDataSource.getRepository(EvaluationHistory).save(historyEntry);
    }

    // Save the evaluation with updated validation report
    await AppDataSource.getRepository(MeasurementEvaluation).save(evaluation);

    return JSON.stringify(validationReport);
  }

  /**
   * Check if a string is a URL
   * @param str String to check
   * @returns Boolean indicating if string is a URL
   */
  private static isURL(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate a URL is reachable
   * @param url URL to validate
   * @returns Validation result
   */
  private static async validateURL(url: string): Promise<any> {
    try {
      await axios.head(url, { timeout: 5000 });
      return {
        name: 'url_validation',
        valid: true,
        message: 'URL is valid and reachable'
      };
    } catch (error) {
      return {
        name: 'url_validation',
        valid: false,
        message: 'URL is not reachable'
      };
    }
  }

  /**
   * Validate that a URL has meaningful content
   * @param url URL to check
   * @returns Validation result
   */
  private static async validateURLContent(url: string): Promise<any> {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      const content = response.data.toString();

      // Check if content is too short (possibly empty page)
      if (content.length < 100) {
        return {
          name: 'url_content',
          valid: false,
          message: 'URL content is too short to be meaningful'
        };
      }

      return {
        name: 'url_content',
        valid: true,
        message: 'URL contains meaningful content'
      };
    } catch (error) {
      return {
        name: 'url_content',
        valid: false,
        message: 'Could not retrieve content from URL'
      };
    }
  }

  /**
   * Validate the quality of notes
   * @param notes Notes to validate
   * @returns Validation result
   */
  private static validateNotesQuality(notes: string): any {
    // Check if notes are too short
    if (notes.length < 20) {
      return {
        name: 'notes_quality',
        valid: false,
        message: 'Notes are too short to be meaningful'
      };
    }

    // Check for common issues in notes
    const commonIssues = ['todo', 'tbd', 'fix this', 'update later', 'placeholder'];
    for (const issue of commonIssues) {
      if (notes.toLowerCase().includes(issue)) {
        return {
          name: 'notes_quality',
          valid: false,
          message: `Notes contain placeholder text: "${issue}"`
        };
      }
    }

    return {
      name: 'notes_quality',
      valid: true,
      message: 'Notes are of good quality'
    };
  }
}
